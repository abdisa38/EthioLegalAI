import { forwardRef } from 'react';
import { FieldPath, FieldValues, Controller, useFormContext } from 'react-hook-form';
import { Input } from '../../../app/components/ui/input';
import { Label } from '../../../app/components/ui/label';
import { cn } from '../../../app/components/ui/utils';

interface FormInputProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      name,
      label,
      placeholder,
      type = 'text',
      description,
      required,
      disabled,
    },
    ref,
  ) => {
    const { control, formState } = useFormContext();
    const error = formState.errors[name];
    const isInvalid = Boolean(error);

    return (
      <div className="space-y-1.5">
        {label && (
          <Label htmlFor={name} className={required ? 'after:content-["*"] after:ml-0.5 after:text-destructive' : ''}>
            {label}
          </Label>
        )}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Input
              {...field}
              ref={ref}
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? `${name}-error` : undefined}
              className={cn(
                isInvalid && 'border-destructive focus-visible:ring-destructive',
              )}
            />
          )}
        />
        {isInvalid && (
          <p id={`${name}-error`} className="text-xs text-destructive">
            {error?.message?.toString()}
          </p>
        )}
        {description && !isInvalid && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    );
  },
);

FormInput.displayName = 'FormInput';
