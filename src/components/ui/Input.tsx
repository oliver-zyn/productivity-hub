import React from "react";
import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      icon,
      iconPosition = "left",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={cn(
              "block w-full px-4 py-2",
              "bg-gray-700/50 border border-gray-600/50 rounded-lg",
              "text-gray-100 placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10",
              error &&
                "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50",
              className
            )}
            ref={ref}
            {...props}
          />

          {icon && iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
