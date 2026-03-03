import { FormFieldConfig } from '@/types/formFields';
import {
  FormInput,
  FormTextArea,
  FormDatePicker,
  FormNumberInput,
  FormCheckbox,
  FormSelect,
  FormJsonArrayInput,
  FormSignatureInput,
} from '@/components/form-inputs';
import FIMItemsInput from './FIMItemsInput';

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  editable?: boolean;
  tenantId?: string;
}

export default function DynamicFormField({
  field,
  value,
  onChange,
  error,
  editable = true,
  tenantId,
}: DynamicFormFieldProps) {
  if (field.hidden) return null;

  const handleChange = (newValue: any) => {
    onChange(field.name, newValue);
  };

  if (field.name === 'items' && field.type === 'jsonb') {
    return (
      <FIMItemsInput
        value={value}
        onChange={handleChange}
        disabled={!editable}
      />
    );
  }

  switch (field.type) {
    case 'text':
      return (
        <FormInput
          label={field.label}
          value={value || ''}
          onChangeText={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          error={error}
          editable={editable}
        />
      );

    case 'textarea':
      return (
        <FormTextArea
          label={field.label}
          value={value || ''}
          onChangeText={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          error={error}
          rows={field.rows}
          editable={editable}
        />
      );

    case 'date':
      return (
        <FormDatePicker
          label={field.label}
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          error={error}
          editable={editable}
        />
      );

    case 'number':
      return (
        <FormNumberInput
          label={field.label}
          value={value ?? null}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          error={error}
          editable={editable}
          min={field.validation?.min}
          max={field.validation?.max}
          decimal={field.name.includes('monto') || field.name.includes('horas')}
        />
      );

    case 'boolean':
      return (
        <FormCheckbox
          label={field.label}
          value={value || false}
          onChange={handleChange}
          error={error}
          editable={editable}
        />
      );

    case 'select':
      return (
        <FormSelect
          label={field.label}
          value={value || ''}
          onChange={handleChange}
          options={field.options || []}
          placeholder={field.placeholder}
          required={field.required}
          error={error}
          editable={editable}
        />
      );

    case 'jsonb':
      console.log('DynamicFormField jsonb case:', {
        fieldName: field.name,
        value,
        valueType: typeof value,
        isArray: Array.isArray(value),
        defaulted: value || []
      });
      return (
        <FormJsonArrayInput
          label={field.label}
          value={value || []}
          onChange={handleChange}
          itemTemplate={field.itemTemplate || {}}
          itemLabels={field.itemLabels || {}}
          itemTypes={field.itemTypes}
          itemSelectOptions={field.itemSelectOptions}
          required={field.required}
          error={error}
          editable={editable}
          tenantId={tenantId}
        />
      );

    case 'signature':
      return (
        <FormSignatureInput
          label={field.label}
          value={value || ''}
          onChange={handleChange}
          error={error}
          editable={editable}
        />
      );

    default:
      return null;
  }
}
