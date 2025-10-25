/**
 * Callout component for info/warning/error messages
 */

import React from 'react';

export interface CalloutProps {
  variant: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
  className?: string;
  styles?: {
    container?: string;
    icon?: string;
    content?: string;
  };
}

const icons = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
};

export function Callout({ variant, children, className, styles }: CalloutProps) {
  return (
    <div
      className={className || styles?.container}
      role="alert"
      data-variant={variant}
    >
      <span className={styles?.icon}>{icons[variant]}</span>
      <div className={styles?.content}>{children}</div>
    </div>
  );
}
