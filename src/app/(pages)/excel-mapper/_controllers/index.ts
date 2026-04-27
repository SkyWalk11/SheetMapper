'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  parseFile,
  buildInitialMappings,
  applyFilters,
  applyMappings,
  applyGroups,
  rowsToCSV,
} from '@/lib/utils/excelMapper';
import type {
  ColumnGroup,
  ColumnMapping,
  FilterCondition,
  FilterLogic,
  ImportedData,
  RowFilter,
} from '@/lib/types/excel-mapper';

const PREVIEW_LIMIT = 50;
const EMPTY_FILTER: RowFilter = { conditions: [], logic: 'and' };

export const useExcelMapperController = () => {
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [groups, setGroups] = useState<ColumnGroup[]>([]);
  const [rowFilter, setRowFilter] = useState<RowFilter>(EMPTY_FILTER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable refs for download callbacks
  const importedDataRef = useRef(importedData);
  importedDataRef.current = importedData;
  const mappingsRef = useRef(mappings);
  mappingsRef.current = mappings;
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  const rowFilterRef = useRef(rowFilter);
  rowFilterRef.current = rowFilter;

  // ── File ────────────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parseFile(file);
      setImportedData(data);
      setMappings(buildInitialMappings(data.columns));
      setGroups([]);
      setRowFilter(EMPTY_FILTER);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Mappings ────────────────────────────────────────────────────────────────
  const updateMapping = useCallback((index: number, updated: ColumnMapping) => {
    setMappings((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const toggleAllMappings = useCallback((enabled: boolean) => {
    setMappings((prev) => prev.map((m) => ({ ...m, enabled })));
  }, []);

  // ── Row filters ─────────────────────────────────────────────────────────────
  const addFilterCondition = useCallback(() => {
    setRowFilter((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { id: crypto.randomUUID(), column: '', operator: 'equals', value: '' } as FilterCondition,
      ],
    }));
  }, []);

  const updateFilterCondition = useCallback((id: string, updated: Partial<FilterCondition>) => {
    setRowFilter((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));
  }, []);

  const removeFilterCondition = useCallback((id: string) => {
    setRowFilter((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  }, []);

  const setFilterLogic = useCallback((logic: FilterLogic) => {
    setRowFilter((prev) => ({ ...prev, logic }));
  }, []);

  // ── Groups ──────────────────────────────────────────────────────────────────
  const addGroup = useCallback(() => {
    setGroups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', operation: 'sum', columns: [], separator: ' ' },
    ]);
  }, []);

  const updateGroup = useCallback((id: string, updated: Partial<ColumnGroup>) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
  }, []);

  const removeGroup = useCallback((id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // ── Preview pipeline: filter → slice → map → group ──────────────────────────
  // applyFilters runs on all rows (cheap — boolean checks only).
  // applyMappings + applyGroups only run on the sliced preview.
  const filteredRows = useMemo(
    () => (importedData ? applyFilters(importedData.rows, rowFilter) : []),
    [importedData, rowFilter]
  );

  const mappedRows = useMemo(() => {
    const preview = filteredRows.slice(0, PREVIEW_LIMIT);
    const mapped = applyMappings(preview, mappings);
    return applyGroups(mapped, groups);
  }, [filteredRows, mappings, groups]);

  const mappedColumns = useMemo(
    () => (mappedRows.length > 0 ? Object.keys(mappedRows[0]) : []),
    [mappedRows]
  );

  const mappedColumnNames = useMemo(
    () => mappings.filter((m) => m.enabled).map((m) => m.newKey.trim() || m.originalKey),
    [mappings]
  );

  // ── Downloads (full data, uses refs) ────────────────────────────────────────
  const downloadJSON = useCallback(() => {
    const data = importedDataRef.current;
    if (!data) return;
    const filtered = applyFilters(data.rows, rowFilterRef.current);
    const mapped = applyMappings(filtered, mappingsRef.current);
    const all = applyGroups(mapped, groupsRef.current);
    triggerDownload(
      new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' }),
      'mapped-data.json'
    );
  }, []);

  const downloadCSV = useCallback(() => {
    const data = importedDataRef.current;
    if (!data) return;
    const filtered = applyFilters(data.rows, rowFilterRef.current);
    const mapped = applyMappings(filtered, mappingsRef.current);
    const all = applyGroups(mapped, groupsRef.current);
    triggerDownload(new Blob([rowsToCSV(all)], { type: 'text/csv' }), 'mapped-data.csv');
  }, []);

  const downloadExcel = useCallback(async () => {
    const data = importedDataRef.current;
    if (!data) return;
    const filtered = applyFilters(data.rows, rowFilterRef.current);
    const mapped = applyMappings(filtered, mappingsRef.current);
    const all = applyGroups(mapped, groupsRef.current);
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(all);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    triggerDownload(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      'mapped-data.xlsx'
    );
  }, []);

  const reset = useCallback(() => {
    setImportedData(null);
    setMappings([]);
    setGroups([]);
    setRowFilter(EMPTY_FILTER);
    setError(null);
  }, []);

  return {
    importedData,
    mappings,
    groups,
    rowFilter,
    filteredRows,
    mappedRows,
    mappedColumns,
    mappedColumnNames,
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
  };
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
