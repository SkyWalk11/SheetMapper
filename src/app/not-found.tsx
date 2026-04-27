import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">404 — Page Not Found</h2>
      <p className="text-zinc-500">Could not find the requested resource.</p>
      <Link
        href="/"
        className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
      >
        Return Home
      </Link>
    </div>
  );
}
