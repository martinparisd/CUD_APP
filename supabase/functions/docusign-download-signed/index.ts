import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function toBase64Url(buf: Uint8Array): string {
  let binary = "";
  for (const b of buf) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function textToUint8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

async function importRsaKey(pem: string): Promise<CryptoKey> {
  const lines = pem
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, "")
    .replace(/-----END RSA PRIVATE KEY-----/, "")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(lines), (c) => c.charCodeAt(0));

  try {
    return await crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
  } catch {
    const pkcs8Header = new Uint8Array([
      0x30, 0x82, 0x00, 0x00, 0x02, 0x01, 0x00, 0x30, 0x0d, 0x06, 0x09, 0x2a,
      0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x04, 0x82,
      0x00, 0x00,
    ]);
    const totalLen = pkcs8Header.length + binaryDer.length;
    const wrapped = new Uint8Array(totalLen);
    wrapped.set(pkcs8Header);
    wrapped.set(binaryDer, pkcs8Header.length);
    const seqLen = totalLen - 4;
    wrapped[2] = (seqLen >> 8) & 0xff;
    wrapped[3] = seqLen & 0xff;
    const octetLen = binaryDer.length;
    wrapped[pkcs8Header.length - 2] = (octetLen >> 8) & 0xff;
    wrapped[pkcs8Header.length - 1] = octetLen & 0xff;

    return await crypto.subtle.importKey(
      "pkcs8",
      wrapped,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }
}

async function createJwt(
  integrationKey: string,
  userId: string,
  rsaKey: CryptoKey,
  authServer: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: integrationKey,
    sub: userId,
    aud: authServer,
    iat: now,
    exp: now + 3600,
    scope: "signature impersonation",
  };
  const enc = (obj: unknown) => toBase64Url(textToUint8(JSON.stringify(obj)));
  const signingInput = `${enc(header)}.${enc(payload)}`;
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    rsaKey,
    textToUint8(signingInput)
  );
  return `${signingInput}.${toBase64Url(new Uint8Array(sig))}`;
}

async function getAccessToken(
  jwt: string,
  authServer: string
): Promise<string> {
  const res = await fetch(`https://${authServer}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DocuSign token error (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { envelopeId } = await req.json();
    if (!envelopeId) {
      return new Response(
        JSON.stringify({ error: "envelopeId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const integrationKey = Deno.env.get("DOCUSIGN_INTEGRATION_KEY")!;
    const rsaPem = Deno.env.get("DOCUSIGN_RSA_PRIVATE_KEY")!;
    const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID")!;
    const dsUserId = Deno.env.get("DOCUSIGN_USER_ID")!;

    const authServer = "account-d.docusign.com";
    const apiBase = "https://demo.docusign.net/restapi";

    const rsaKey = await importRsaKey(rsaPem);
    const jwt = await createJwt(integrationKey, dsUserId, rsaKey, authServer);
    const accessToken = await getAccessToken(jwt, authServer);

    const statusRes = await fetch(
      `${apiBase}/v2.1/accounts/${accountId}/envelopes/${envelopeId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!statusRes.ok) {
      const errText = await statusRes.text();
      console.error("DocuSign status error:", errText);
      return new Response(
        JSON.stringify({
          error: `DocuSign API error (${statusRes.status})`,
          details: errText,
        }),
        {
          status: statusRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const envelopeData = await statusRes.json();
    const status = envelopeData.status as string;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let pdfBase64: string | undefined;
    let signedPdfPath: string | undefined;

    if (status === "completed") {
      const { data: envelope } = await supabase
        .from("docusign_envelopes")
        .select("signed_pdf_path, file_name")
        .eq("envelope_id", envelopeId)
        .maybeSingle();

      if (envelope?.signed_pdf_path) {
        await supabase
          .from("docusign_envelopes")
          .update({ status, completed_at: new Date().toISOString() })
          .eq("envelope_id", envelopeId);

        return new Response(
          JSON.stringify({
            status,
            signedPdfPath: envelope.signed_pdf_path,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const pdfRes = await fetch(
        `${apiBase}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/combined`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!pdfRes.ok) {
        const errText = await pdfRes.text();
        console.error("DocuSign download error:", errText);
        return new Response(
          JSON.stringify({ status, error: "Failed to download signed PDF" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const pdfBuf = await pdfRes.arrayBuffer();
      const pdfBytes = new Uint8Array(pdfBuf);

      const fileName = envelope?.file_name || `signed_${envelopeId}.pdf`;
      const safeName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      const storagePath = `${envelopeId}/${safeName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("signed-documents")
        .upload(storagePath, pdfBytes, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
      } else {
        signedPdfPath = uploadData.path;
      }

      const updateData: Record<string, unknown> = {
        status,
        completed_at: new Date().toISOString(),
      };
      if (signedPdfPath) {
        updateData.signed_pdf_path = signedPdfPath;
      }
      await supabase
        .from("docusign_envelopes")
        .update(updateData)
        .eq("envelope_id", envelopeId);

      let binary = "";
      for (const b of pdfBytes) binary += String.fromCharCode(b);
      pdfBase64 = btoa(binary);
    } else {
      await supabase
        .from("docusign_envelopes")
        .update({ status })
        .eq("envelope_id", envelopeId);
    }

    return new Response(
      JSON.stringify({ status, pdfBase64, signedPdfPath }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("DocuSign download error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
