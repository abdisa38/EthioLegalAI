import { forwardRef } from 'react';
import { FieldPath, FieldValues, Controller, useFormContext } from 'react-hook-form';
import { Textarea } from '../../../app/components/ui/textarea';
import { Label } from '../../../app/components/ui/label';
import { cn } from '../../../app/components/ui/utils';

interface FormTextareaProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      name,
      label,
      placeholder,
      description,
      required,
      disabled,
      rows = 4,
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
            <Textarea
              {...field}
              ref={ref}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
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

FormTextarea.displayName = 'FormTextarea';
