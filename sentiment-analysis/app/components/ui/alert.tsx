// app/components/ui/alert.tsx
import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles = "relative w-full rounded-lg border p-4";
    const variantStyles = variant === "destructive"
      ? "border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600"
      : "bg-white text-gray-900 border-gray-200";

    return (
      <div
        ref={ref}
        role="alert"
        className={`${baseStyles} ${variantStyles} ${className}`}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }