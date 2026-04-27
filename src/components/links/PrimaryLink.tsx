import { cn } from '@/lib/utils';
import { UnstyledLink } from './UnstyledLink';
import type { LinkProps } from 'next/link';

type PrimaryLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

export const PrimaryLink = ({ className, children, ...props }: PrimaryLinkProps) => {
  return (
    <UnstyledLink
      className={cn('font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50', className)}
      {...props}
    >
      {children}
    </UnstyledLink>
  );
};
