export const Footer = () => {
  return (
    <footer className="border-t border-black/[.08] py-6 dark:border-white/[.08]">
      <div className="mx-auto max-w-4xl px-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} App. All rights reserved.
      </div>
    </footer>
  );
};
