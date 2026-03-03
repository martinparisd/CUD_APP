import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Paperclip, FileText, X, Upload } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';

interface FormAttachmentUploadProps {
  value?: string;
  onChange: (fileUrl: string | null) => void;
  recordId?: string;
  tableName: string;
  disabled?: boolean;
}

export default function FormAttachmentUpload({
  value,
  onChange,
  recordId,
  tableName,
  disabled = false,
}: FormAttachmentUploadProps) {
  const [uploading, setUploading] = useState(false);

  const pickAndUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];

      if (!file.uri) {
        Alert.alert('Error', 'No se pudo obtener el archivo');
        return;
      }

      setUploading(true);

      const fileExt = file.name.split('.').pop() || 'pdf';
      const timestamp = Date.now();
      const fileName = `${tableName}/${recordId || 'temp'}_${timestamp}.${fileExt}`;

      let fileToUpload: Blob | File | FormData;

      if (file.file) {
        fileToUpload = file.file;
      } else {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        fileToUpload = blob;
      }

      const { data, error } = await supabase.storage
        .from('documentos')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.mimeType || 'application/octet-stream',
        });

      if (error) {
        console.error('Upload error:', error);
        Alert.alert('Error', `No se pudo subir el archivo: ${error.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(data.path);

      onChange(publicUrlData.publicUrl);
      Alert.alert('Éxito', 'Archivo subido correctamente');
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = () => {
    Alert.alert(
      'Eliminar adjunto',
      '¿Estás seguro de que deseas eliminar este archivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onChange(null),
        },
      ]
    );
  };

  const viewAttachment = () => {
    if (value) {
      Alert.alert('Archivo adjunto', value, [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Abrir',
          onPress: () => {
            console.log('Open file:', value);
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Archivo adjunto</Text>

      {value ? (
        <View style={styles.attachmentContainer}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={viewAttachment}
            disabled={disabled}
            activeOpacity={0.7}>
            <FileText size={20} color="#5B4CDB" strokeWidth={2} />
            <Text style={styles.attachmentText} numberOfLines={1}>
              Archivo adjunto
            </Text>
          </TouchableOpacity>
          {!disabled && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeAttachment}
              activeOpacity={0.7}>
              <X size={18} color="#EF4444" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, disabled && styles.uploadButtonDisabled]}
          onPress={pickAndUploadDocument}
          disabled={disabled || uploading}
          activeOpacity={0.7}>
          {uploading ? (
            <ActivityIndicator size="small" color="#5B4CDB" />
          ) : (
            <>
              <Upload size={20} color="#5B4CDB" strokeWidth={2} />
              <Text style={styles.uploadText}>Subir archivo</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.hint}>
        Formatos permitidos: PDF, DOC, DOCX, JPG, PNG
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B4CDB',
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  attachmentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#5B4CDB',
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
});
