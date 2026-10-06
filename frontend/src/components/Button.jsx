import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'outline-red'
      ? 'btn-outline-red'
      : 'btn-ghost';

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
          {children}
        </>
      )}
    </button>
  );
};
