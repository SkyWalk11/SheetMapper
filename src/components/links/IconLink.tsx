import { cn } from '@/lib/utils';
import { UnstyledLink } from './UnstyledLink';
import type { LinkProps } from 'next/link';

type IconLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    label: string;
  };

export const IconLink = ({ className, children, label, ...props }: IconLinkProps) => {
  return (
    <UnstyledLink
      aria-label={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06]',
        className
      )}
      {...props}
    >
      {children}
    </UnstyledLink>
  );
};
