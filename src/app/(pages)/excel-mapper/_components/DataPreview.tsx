type DataPreviewProps = {
  columns: string[];
  rows: Record<string, unknown>[];
  maxRows?: number;
  label?: string;
};

export const DataPreview = ({ columns, rows, maxRows = 5, label = 'Preview' }: DataPreviewProps) => {
  const preview = rows.slice(0, maxRows);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</h3>
        <span className="text-xs text-zinc-400">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/60">
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                {columns.map((col) => (
                  <td
                    key={col}
                    className="max-w-[200px] truncate whitespace-nowrap px-3 py-2 text-zinc-700 dark:text-zinc-300"
                    title={String(row[col] ?? '')}
                  >
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > maxRows && (
        <p className="text-xs text-zinc-400">Showing {maxRows} of {rows.length} rows</p>
      )}
    </div>
  );
};
