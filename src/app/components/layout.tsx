export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-12">
      <h1 className="mb-8 text-3xl font-semibold">Components</h1>
      {children}
    </div>
  );
}
