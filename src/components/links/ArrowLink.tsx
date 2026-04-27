import { cn } from '@/lib/utils';
import { UnstyledLink } from './UnstyledLink';
import type { LinkProps } from 'next/link';

type ArrowLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

export const ArrowLink = ({ className, children, ...props }: ArrowLinkProps) => {
  return (
    <UnstyledLink
      className={cn('inline-flex items-center gap-1 font-medium hover:gap-2 transition-all', className)}
      {...props}
    >
      {children}
      <span aria-hidden>→</span>
    </UnstyledLink>
  );
};
