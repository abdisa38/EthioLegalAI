import { forwardRef } from 'react';
import { FieldPath, FieldValues, Controller, useFormContext } from 'react-hook-form';
import { Label } from '../../../app/components/ui/label';
import { cn } from '../../../app/components/ui/utils';

interface FormFileInputProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
}

export const FormFileInput = forwardRef<HTMLInputElement, FormFileInputProps>(
  (
    {
      name,
      label,
      description,
      required,
      disabled,
      accept,
      multiple = false,
    },
    ref,
  ) => {
    const { control, formState } = useFormContext();
    const error = formState.errors[name];
    const isInvalid = Boolean(error);

    return (
      <div className="space-y-1.5">
        {label && (
          <Label className={required ? 'after:content-["*"] after:ml-0.5 after:text-destructive' : ''}>
            {label}
          </Label>
        )}
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value, ...field } }) => (
            <div
              className={cn(
                'relative rounded-lg border-2 border-dashed border-muted-foreground/50 p-6 text-center cursor-pointer transition-colors hover:border-primary hover:bg-accent',
                isInvalid && 'border-destructive',
              )}
            >
              <input
                {...field}
                ref={ref}
                type="file"
                multiple={multiple}
                accept={accept}
                disabled={disabled}
                onChange={(e) => {
                  onChange(multiple ? e.target.files : e.target.files?.[0]);
                }}
                aria-invalid={isInvalid}
                aria-describedby={isInvalid ? `${name}-error` : undefined}
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
              />
              <div className="pointer-events-none">
                <div className="text-sm font-medium">
                  {value?.name || 'Click to select file or drag and drop'}
                </div>
                {description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}
        />
        {isInvalid && (
          <p id={`${name}-error`} className="text-xs text-destructive">
            {error?.message?.toString()}
          </p>
        )}
      </div>
    );
  },
);

FormFileInput.displayName = 'FormFileInput';
