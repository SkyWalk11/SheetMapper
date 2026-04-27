import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        map-excel playground
      </h1>
      <p className="max-w-sm text-zinc-500">
        Import an Excel or CSV file, remap column keys, and define value-transformation rules.
      </p>
      <Link
        href="/excel-mapper"
        className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Open Mapper →
      </Link>
    </main>
  );
}
