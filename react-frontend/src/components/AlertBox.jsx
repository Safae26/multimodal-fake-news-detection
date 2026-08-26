import React from 'react';

/**
 * A customizable alert box component.
 * @param {'info'|'warning'|'error'|'success'} type - Determines colors and background.
 * @param {React.Component} icon - Optional icon component (e.g., AlertCircle).
 * @param {React.ReactNode} children - Alert message/content.
 */
export default function AlertBox({ type = 'info', icon: Icon, children }) {
  const bgColors = {
    info: 'bg-indigo-50 dark:bg-indigo-950/10',
    warning: 'bg-amber-50 dark:bg-amber-950/10',
    error: 'bg-red-50 dark:bg-red-950/10',
    success: 'bg-green-50 dark:bg-green-950/10',
  };
  const textColors = {
    info: 'text-indigo-600 dark:text-indigo-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
  };

  const bg = bgColors[type] || bgColors.info;
  const txt = textColors[type] || textColors.info;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl ${bg} ${txt}`}>
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      {children && <div className="flex-1 text-sm">{children}</div>}
    </div>
  );
}
