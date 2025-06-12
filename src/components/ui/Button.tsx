import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'white';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: React.ElementType;
  to?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  as: Component = 'button',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";
  
  const variantStyles = {
    primary: "bg-primary text-background hover:bg-primary-dark border border-transparent",
    secondary: "bg-card text-text-primary hover:bg-background border border-transparent",
    outline: "bg-transparent text-text-primary hover:bg-card border border-text-secondary",
    white: "bg-text-primary text-background hover:bg-text-secondary border border-transparent"
  };
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
    xl: "px-6 py-3 text-xl"
  };
  
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <Component className={styles} {...props}>
      {children}
    </Component>
  );
};

export default Button;