/*
  # Add Individual FIM Assessment Items

  1. Changes
    - Add 18 individual columns to `formularios_fim` table for each FIM assessment item
    - Each column stores the score (1-7) for that specific functional independence measure
    - Columns are named item_1_alimentacion through item_18_memoria
    
  2. Column Details
    - All columns are integer type (storing values 1-7)
    - All columns are nullable to allow partial form completion
    - Follows the standardized FIM assessment structure with 6 categories:
      * Autocuidado (items 1-6)
      * Control de Esfínteres (items 7-8)
      * Transferencias (items 9-11)
      * Locomoción (items 12-13)
      * Comunicación (items 14-15)
      * Cognición Social (items 16-18)
*/

-- Add individual FIM assessment item columns
DO $$
BEGIN
  -- Autocuidado (Self-care)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_1_alimentacion'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_1_alimentacion INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_2_aseo_personal'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_2_aseo_personal INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_3_higiene'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_3_higiene INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_4_vestido_superior'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_4_vestido_superior INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_5_vestido_inferior'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_5_vestido_inferior INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_6_uso_bano'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_6_uso_bano INTEGER;
  END IF;

  -- Control de Esfínteres (Sphincter Control)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_7_control_intestinos'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_7_control_intestinos INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_8_control_vejiga'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_8_control_vejiga INTEGER;
  END IF;

  -- Transferencias (Transfers)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_9_transferencia_cama'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_9_transferencia_cama INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_10_transferencia_bano'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_10_transferencia_bano INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_11_transferencia_ducha'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_11_transferencia_ducha INTEGER;
  END IF;

  -- Locomoción (Locomotion)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_12_marcha'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_12_marcha INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_13_escaleras'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_13_escaleras INTEGER;
  END IF;

  -- Comunicación (Communication)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_14_comprension'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_14_comprension INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_15_expresion'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_15_expresion INTEGER;
  END IF;

  -- Cognición Social (Social Cognition)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_16_interaccion_social'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_16_interaccion_social INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_17_resolucion_problemas'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_17_resolucion_problemas INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formularios_fim' AND column_name = 'item_18_memoria'
  ) THEN
    ALTER TABLE formularios_fim ADD COLUMN item_18_memoria INTEGER;
  END IF;
END $$;