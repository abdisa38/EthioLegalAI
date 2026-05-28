import { FieldPath, FieldValues, Controller, useFormContext } from 'react-hook-form';
import { Checkbox } from '../../../app/components/ui/checkbox';
import { Label } from '../../../app/components/ui/label';

interface FormCheckboxProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormCheckbox<T extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  disabled,
}: FormCheckboxProps<T>) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const isInvalid = Boolean(error);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Checkbox
              {...field}
              id={name}
              disabled={disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? `${name}-error` : undefined}
            />
          )}
        />
        {label && (
          <Label
            htmlFor={name}
            className={`cursor-pointer ${required ? 'after:content-["*"] after:ml-0.5 after:text-destructive' : ''}`}
          >
            {label}
          </Label>
        )}
      </div>
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
}
