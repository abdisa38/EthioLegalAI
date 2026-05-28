import { FieldPath, FieldValues, Controller, useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../app/components/ui/select';
import { Label } from '../../../app/components/ui/label';
import { cn } from '../../../app/components/ui/utils';

interface FormSelectProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function FormSelect<T extends FieldValues = FieldValues>({
  name,
  label,
  placeholder = 'Select an option',
  description,
  required,
  disabled,
  options,
}: FormSelectProps<T>) {
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
        render={({ field }) => (
          <Select
            value={field.value || ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? `${name}-error` : undefined}
              className={cn(
                isInvalid && 'border-destructive',
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
}
