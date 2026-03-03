export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'boolean'
  | 'select'
  | 'jsonb'
  | 'signature'
  | 'file';

export interface FormFieldConfig {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  section?: string;
  hidden?: boolean;
  multiline?: boolean;
  rows?: number;
  decimal?: boolean;
  itemTemplate?: Record<string, any>;
  itemLabels?: Record<string, string>;
}

export interface FormSection {
  title: string;
  fields: FormFieldConfig[];
}

export interface FormConfig {
  tableName: string;
  sections: FormSection[];
}
