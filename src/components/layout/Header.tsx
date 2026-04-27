import { ButtonLink } from '@/components/links/ButtonLink';
import { UnstyledLink } from '@/components/links/UnstyledLink';

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-black/[.08] bg-white/80 backdrop-blur dark:border-white/[.08] dark:bg-black/80">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-8">
        <UnstyledLink href="/" className="font-semibold">
          App
        </UnstyledLink>
        <nav className="flex items-center gap-4">
          <UnstyledLink href="/components" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            Components
          </UnstyledLink>
          <ButtonLink href="/login">Sign in</ButtonLink>
        </nav>
      </div>
    </header>
  );
};
