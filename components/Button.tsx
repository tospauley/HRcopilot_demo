import React from 'react';

/**
 * HRcopilot Design System — Button
 *
 * Variants:
 *   primary   — brand purple  (#0047cc)  main CTA
 *   secondary — outlined/ghost           supporting actions
 *   success   — emerald                  confirm / approve
 *   danger    — rose                     destructive / reject
 *   warning   — amber                    caution actions (apply leave, etc.)
 *   ghost     — text-only link style     inline actions
 *
 * Sizes:  sm | md | lg
 */

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-[#0047cc] text-white border border-transparent shadow-lg shadow-[#e0f2fe]0/20 hover:bg-[#7040d4] hover:shadow-[#e0f2fe]0/30 active:bg-[#6030c0]',
  secondary:
    'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20',
  success:
    'bg-emerald-500 text-white border border-transparent shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 active:bg-emerald-700',
  danger:
    'bg-rose-500 text-white border border-transparent shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:shadow-rose-500/30 active:bg-rose-700',
  warning:
    'bg-amber-500 text-white border border-transparent shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:shadow-amber-500/30 active:bg-amber-700',
  ghost:
    'bg-transparent text-[#0047cc] border border-transparent hover:text-[#7040d4] hover:underline underline-offset-2',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-[9px] rounded-lg  gap-1.5',
  md:  'px-5 py-2.5 text-[10px] rounded-xl gap-2',
  lg:  'px-7 py-3.5 text-[11px] rounded-2xl gap-2.5',
};

const Spinner = () => (
  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-black uppercase tracking-widest',
        'transition-all duration-150 select-none',
        'hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0047cc]/40',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? <Spinner /> : icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;

