export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'No records found.',
  isLoading = false,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-agt-lg border border-agt-border">
      <table className="w-full text-left font-agt-sans text-agt-body text-agt-text">
        <thead>
          <tr className="bg-agt-elevated border-b border-agt-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-agt-4 py-agt-3 text-agt-sm font-medium text-agt-text-muted uppercase tracking-wide"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-agt-4 py-agt-6">
                <div className="flex flex-col gap-agt-3 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-agt-4 rounded-agt-sm bg-agt-elevated w-full"
                    />
                  ))}
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-agt-4 py-agt-10 text-center text-agt-text-muted text-agt-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-agt-border last:border-0 hover:bg-agt-elevated transition-colors duration-100"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-agt-4 py-agt-3">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
