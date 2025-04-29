
import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
  error?: string;
}

const FormField = ({
  label,
  htmlFor,
  required = false,
  className,
  labelClassName,
  children,
  error
}: FormFieldProps) => {
  const id = htmlFor || React.useId();
  
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label 
        htmlFor={id} 
        className={cn(labelClassName, "block text-sm font-medium mb-1")}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {React.isValidElement(children) 
        ? React.cloneElement(children as React.ReactElement, { 
            id, 
            "aria-required": required 
          }) 
        : children}
        
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

export default FormField;
