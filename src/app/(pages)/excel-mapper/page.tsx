'use client';

import { useExcelMapperController } from './_controllers';
import { FileUpload } from './_components/FileUpload';
import { DataPreview } from './_components/DataPreview';
import { MappingConfig } from './_components/MappingConfig';
import { ColumnGroups } from './_components/ColumnGroups';
import { MappedResult } from './_components/MappedResult';
import { RowFilters } from './_components/RowFilters';

export default function ExcelMapperPage() {
  const {
    importedData,
    mappings,
    groups,
    mappedRows,
    mappedColumns,
    mappedColumnNames,
    rowFilter,
    filteredRows,
    isLoading,
    error,
    handleFile,
    updateMapping,
    toggleAllMappings,
    addFilterCondition,
    updateFilterCondition,
    removeFilterCondition,
    setFilterLogic,
    addGroup,
    updateGroup,
    removeGroup,
    downloadJSON,
    downloadCSV,
    downloadExcel,
    reset,
  } = useExcelMapperController();

  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Excel / CSV Mapper
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Import a file, rename columns, transform values, and group columns.
            </p>
          </div>
          {importedData && (
            <button
              onClick={reset}
              className="text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Upload */}
        <FileUpload
          onFile={handleFile}
          isLoading={isLoading}
          currentFileName={importedData?.fileName}
        />

        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        {importedData && (
          <div className="mt-8 flex flex-col gap-10 pb-24">
            {/* 1. Original data */}
            <section>
              <DataPreview
                columns={importedData.columns}
                rows={importedData.rows}
                label="Original Data"
                maxRows={5}
              />
            </section>

            {/* 2. Row filters */}
            <section>
              <RowFilters
                rowFilter={rowFilter}
                columns={importedData.columns}
                totalRows={importedData.rows.length}
                filteredCount={filteredRows.length}
                onAdd={addFilterCondition}
                onUpdate={updateFilterCondition}
                onRemove={removeFilterCondition}
                onSetLogic={setFilterLogic}
              />
            </section>

            {/* 3. Mapped result — updates live as config changes */}
            <section>
              <MappedResult columns={mappedColumns} rows={mappedRows} />
            </section>

            {/* 4. Column mapping config */}
            <section>
              <MappingConfig mappings={mappings} onChange={updateMapping} onToggleAll={toggleAllMappings} />
            </section>

            {/* 5. Column groups */}
            <section>
              <ColumnGroups
                groups={groups}
                availableColumns={mappedColumnNames}
                onAdd={addGroup}
                onUpdate={updateGroup}
                onRemove={removeGroup}
              />
            </section>
          </div>
        )}
      </main>

      {/* Floating export FAB */}
      {importedData && mappedRows.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <span className="mr-1 text-xs text-zinc-400">Export all rows</span>
          <button
            onClick={downloadCSV}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            ↓ CSV
          </button>
          <button
            onClick={downloadJSON}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            ↓ JSON
          </button>
          <button
            onClick={downloadExcel}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            ↓ Excel
          </button>
        </div>
      )}
    </>
  );
}
