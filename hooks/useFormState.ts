import { useState, useCallback } from 'react';
import { FormConfig } from '@/types/formFields';

interface UseFormStateOptions {
  initialData?: Record<string, any>;
  config: FormConfig;
}

export function useFormState({ initialData = {}, config }: UseFormStateOptions) {
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((name: string, value: any) => {
    setData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    config.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required && !data[field.name]) {
          newErrors[field.name] = `${field.label} es requerido`;
        }

        if (field.validation?.pattern && data[field.name]) {
          if (!field.validation.pattern.test(data[field.name])) {
            newErrors[field.name] =
              field.validation.message || `${field.label} tiene un formato inválido`;
          }
        }

        if (field.validation?.min !== undefined && data[field.name] < field.validation.min) {
          newErrors[field.name] = `${field.label} debe ser mayor o igual a ${field.validation.min}`;
        }

        if (field.validation?.max !== undefined && data[field.name] > field.validation.max) {
          newErrors[field.name] = `${field.label} debe ser menor o igual a ${field.validation.max}`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config, data]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  return {
    data,
    errors,
    isDirty,
    handleChange,
    validate,
    reset,
    setData,
  };
}
