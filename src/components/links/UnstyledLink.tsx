import Link, { type LinkProps } from 'next/link';
import { cn } from '@/lib/utils';

type UnstyledLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

export const UnstyledLink = ({ className, children, ...props }: UnstyledLinkProps) => {
  return (
    <Link className={cn(className)} {...props}>
      {children}
    </Link>
  );
};
