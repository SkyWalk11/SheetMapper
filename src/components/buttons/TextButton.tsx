import { cn } from '@/lib/utils';

type TextButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const TextButton = ({ className, children, ...props }: TextButtonProps) => {
  return (
    <button
      className={cn(
        'text-sm font-medium underline-offset-4 hover:underline disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
