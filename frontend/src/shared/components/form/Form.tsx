import { ReactNode } from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { Button } from '../../../app/components/ui/button';
import { cn } from '../../../app/components/ui/utils';

interface FormProps<TFieldValues extends Record<string, any>> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  submitButtonLabel?: string;
  isLoading?: boolean;
  successMessage?: string;
}

export function Form<TFieldValues extends Record<string, any>>({
  form,
  onSubmit,
  children,
  className,
  submitButtonLabel = 'Submit',
  isLoading = false,
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', className)}
      >
        {children}
        <Button
          type="submit"
          disabled={isLoading || !form.formState.isValid}
          className="w-full"
        >
          {isLoading && <span className="mr-2 h-4 w-4 animate-spin">⟳</span>}
          {submitButtonLabel}
        </Button>
      </form>
    </FormProvider>
  );
}
