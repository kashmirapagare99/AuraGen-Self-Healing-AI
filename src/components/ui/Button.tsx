import React, { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";

const baseStyles =
  "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

const sizeStyles = {
  sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
  md: "text-sm px-4 py-2 gap-2 h-10",
  lg: "text-base px-5 py-2.5 gap-2.5 h-12",
};

const variantStyles = {
  primary:
    "bg-aura-600 text-white hover:bg-aura-700 active:bg-aura-800 focus:ring-aura-500 shadow-sm",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400 border border-slate-200",
  outline:
    "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 focus:ring-aura-500 shadow-subtle",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 shadow-sm",
  accent:
    "bg-gradient-to-r from-aura-600 to-indigo-700 text-white hover:from-aura-700 hover:to-indigo-800 shadow-card focus:ring-aura-500",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

type ButtonLinkProps = Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  "children" | "className"
> & {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
};

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </Link>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
