import { cn } from '@/lib/utils';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode;
  label: string;
};

export const IconButton = ({ icon, label, className, ...props }: IconButtonProps) => {
  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:hover:bg-white/[.06]',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
};
