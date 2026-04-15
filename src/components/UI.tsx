import React, { HTMLAttributes, ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const Card = ({ children, className, ...props }: CardProps) => (

  <div className={cn("neo-card", className)} {...props}>
    {children}
  </div>
);

interface ButtonProps {
  variant?: 'default' | 'primary' | 'outline';
  children?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  [key: string]: any;
}

export const Button = ({ children, className, variant = 'default', ...props }: ButtonProps) => (
  <button
    className={cn(
      "neo-button",
      variant === 'primary' && "neo-button-primary",
      variant === 'outline' && "bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export const Tag = ({ children, className, color, ...props }: { children: React.ReactNode, className?: string, color?: string, [key: string]: any }) => {
  // Map arbitrary hardcoded tailwind hex codes to our smart CSS variables for dark mode support
  const colorMap: Record<string, { bg: string, text: string, border: string }> = {
    '#fee2e2': { bg: 'var(--bg-danger)', text: 'var(--text-danger)', border: 'var(--border-danger)' }, // red-100
    '#f87171': { bg: 'var(--bg-danger)', text: 'var(--text-danger)', border: 'var(--border-danger)' }, // red-400
    '#dcfce7': { bg: 'var(--bg-success)', text: 'var(--text-success)', border: 'var(--border-success)' }, // green-100
    '#4ade80': { bg: 'var(--bg-success)', text: 'var(--text-success)', border: 'var(--border-success)' }, // green-400
    '#facc15': { bg: 'var(--bg-warning)', text: 'var(--text-warning)', border: 'var(--border-warning)' }, // yellow-400
    '#fbbf24': { bg: 'var(--bg-warning)', text: 'var(--text-warning)', border: 'var(--border-warning)' }, // amber-400
    '#ddd': { bg: 'var(--bg-tertiary)', text: 'var(--text-primary)', border: 'var(--border-color)' }, // gray
    '#e9d5ff': { bg: 'var(--bg-tertiary)', text: 'var(--accent-blue)', border: 'var(--border-color)' }, // purple-100
    '#ede9fe': { bg: 'var(--bg-tertiary)', text: 'var(--accent-blue)', border: 'var(--border-color)' }, // violet-100
    '#e0e7ff': { bg: 'var(--bg-tertiary)', text: 'var(--accent-blue)', border: 'var(--border-color)' }, // indigo-100
    '#3b82f6': { bg: 'var(--accent-blue)', text: '#ffffff', border: 'var(--accent-blue)' }, // blue-500
    '#a855f7': { bg: 'var(--bg-tertiary)', text: 'var(--text-primary)', border: 'var(--border-color)' }, // purple-500
  };

  const themeColors = color && colorMap[color] 
    ? colorMap[color] 
    : { bg: 'var(--bg-tertiary)', text: 'var(--text-primary)', border: 'var(--border-color)' };

  return (
    <span
      className={cn(
        "border px-2 py-0.5 text-xs font-medium uppercase rounded",
        className
      )}
      style={{ 
        backgroundColor: themeColors.bg, 
        color: themeColors.text,
        borderColor: themeColors.border 
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export const ProgressBar = ({ value, max = 100, className, ...props }: { value: number, max?: number, className?: string, [key: string]: any }) => (
  <div className={cn("w-full h-2 neo-border bg-[var(--bg-tertiary)] overflow-hidden rounded", className)} {...props}>
    <div
      className="h-full bg-blue-600 transition-all duration-500"
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
);

export const PageSpinner = ({ label = "Loading…" }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-[var(--text-muted)]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--border-color)] border-t-blue-600" aria-hidden />
    <p className="text-sm font-medium tracking-wide">{label}</p>
  </div>
);

export const EmptyState = ({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) => (
  <div className="neo-card max-w-md mx-auto text-center space-y-4 py-12 bg-[var(--bg-secondary)]">
    <p className="text-lg font-semibold text-[var(--text-primary)]">{title}</p>
    {hint && <p className="text-sm font-normal text-[var(--text-muted)]">{hint}</p>}
    {action}
  </div>
);

export const ErrorState = ({
  title = "Failed to load data",
  hint,
  onRetry,
}: {
  title?: string;
  hint?: string;
  onRetry?: () => void;
}) => (
  <div className="neo-card max-w-md mx-auto text-center space-y-4 py-10 border-red-200 bg-[var(--bg-danger)]">
    <p className="text-lg font-semibold text-red-900">{title}</p>
    {hint && <p className="text-sm font-normal text-[var(--text-danger)]">{hint}</p>}
    {onRetry && (
      <Button variant="primary" type="button" onClick={() => window.location.reload()}>
        Try again
      </Button>
    )}
  </div>
);

export const MoodIcon = ({ mood, size = "md", ...props }: { mood: string | null, size?: "xs" | "sm" | "md" | "lg", [key: string]: any }) => {
  const icons: Record<string, string> = {
    ok: "🙂",
    tired: "😐",
    stressed: "☹",
    "very stressed": "😭",
  };
  const colors: Record<string, string> = {
    ok: "#4ade80",
    tired: "#facc15",
    stressed: "#f87171",
    "very stressed": "#ef4444",
  };

  const sizes = { xs: "text-xs", sm: "text-xl", md: "text-3xl", lg: "text-5xl" };
  const containerSizes = { xs: "w-6 h-6", sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" };

  if (!mood) return <span className={cn("neo-border bg-[var(--bg-tertiary)] flex items-center justify-center rounded-full inline-flex", containerSizes[size])}>?</span>;

  return (
    <span
      className={cn("neo-border flex items-center justify-center rounded-full inline-flex", containerSizes[size])}
      style={{ backgroundColor: colors[mood] || "#ddd" }}
    >
      <span className={sizes[size]}>{icons[mood]}</span>
    </span>
  );
};
