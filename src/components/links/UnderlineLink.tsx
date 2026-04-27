import { cn } from '@/lib/utils';
import { UnstyledLink } from './UnstyledLink';
import type { LinkProps } from 'next/link';

type UnderlineLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

export const UnderlineLink = ({ className, children, ...props }: UnderlineLinkProps) => {
  return (
    <UnstyledLink
      className={cn('underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-400', className)}
      {...props}
    >
      {children}
    </UnstyledLink>
  );
};
