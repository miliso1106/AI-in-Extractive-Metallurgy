import React from 'react';

const SimpleTable = ({ columns, rows, emptyMessage = 'No data available' }) => {
  if (!columns?.length) {
    return (
      <div className="text-sm text-slate-400">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 border-b border-slate-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left font-semibold text-slate-200"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {rows?.length ? (
            rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}`} className="hover:bg-slate-700 transition">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 text-slate-300">
                    {String(cell ?? '')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleTable;
