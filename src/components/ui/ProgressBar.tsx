import React from "react";
import { cn } from "@/utils/cn";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "friction" | "success";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = "md",
  variant = "primary",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const getFrictionColor = (pct: number) => {
    if (pct < 30) return "bg-emerald-500";
    if (pct < 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getBarColor = () => {
    if (variant === "friction") return getFrictionColor(percentage);
    if (variant === "success") return "bg-emerald-500";
    return "bg-aura-600";
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>{label}</span>
          {showValue && <span className="text-slate-500">{percentage}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", getBarColor())}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
