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
      variant === 'outline' && "bg-gray-50 border border-gray-300 hover:bg-gray-100",
      className
    )} 
    {...props}
  >
    {children}
  </button>
);

export const Tag = ({ children, className, color, ...props }: { children: React.ReactNode, className?: string, color?: string, [key: string]: any }) => (
  <span 
    className={cn(
      "border border-gray-300 px-2 py-0.5 text-xs font-medium uppercase rounded",
      className
    )}
    style={{ backgroundColor: color || '#f3f4f6' }}
    {...props}
  >
    {children}
  </span>
);

export const ProgressBar = ({ value, max = 100, className, ...props }: { value: number, max?: number, className?: string, [key: string]: any }) => (
  <div className={cn("w-full h-2 neo-border bg-gray-200 overflow-hidden rounded", className)} {...props}>
    <div 
      className="h-full bg-blue-600 transition-all duration-500" 
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
);

export const PageSpinner = ({ label = "Loading…" }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-gray-500">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600" aria-hidden />
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
  <div className="neo-card max-w-md mx-auto text-center space-y-4 py-12 bg-gray-50">
    <p className="text-lg font-semibold text-gray-900">{title}</p>
    {hint && <p className="text-sm font-normal text-gray-600">{hint}</p>}
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
  <div className="neo-card max-w-md mx-auto text-center space-y-4 py-10 border-red-200 bg-red-50">
    <p className="text-lg font-semibold text-red-900">{title}</p>
    {hint && <p className="text-sm font-normal text-red-800">{hint}</p>}
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
  
  if (!mood) return <span className={cn("neo-border bg-gray-200 flex items-center justify-center rounded-full inline-flex", containerSizes[size])}>?</span>;

  return (
    <span 
      className={cn("neo-border flex items-center justify-center rounded-full inline-flex", containerSizes[size])}
      style={{ backgroundColor: colors[mood] || "#ddd" }}
    >
      <span className={sizes[size]}>{icons[mood]}</span>
    </span>
  );
};
