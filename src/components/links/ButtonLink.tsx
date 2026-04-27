import { cn } from '@/lib/utils';
import { UnstyledLink } from './UnstyledLink';
import type { LinkProps } from 'next/link';

type ButtonLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

export const ButtonLink = ({ className, children, ...props }: ButtonLinkProps) => {
  return (
    <UnstyledLink
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]',
        className
      )}
      {...props}
    >
      {children}
    </UnstyledLink>
  );
};
