'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type FileUploadProps = {
  onFile: (file: File) => void;
  isLoading?: boolean;
  currentFileName?: string;
};

const ACCEPTED = '.xlsx,.xls,.csv';
const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
];

export const FileUpload = ({ onFile, isLoading, currentFileName }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) return;
    onFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload Excel or CSV file"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-colors',
        isDragging
          ? 'border-zinc-500 bg-zinc-50 dark:bg-zinc-900'
          : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-900'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {isLoading ? (
        <p className="text-sm text-zinc-500">Parsing file…</p>
      ) : currentFileName ? (
        <>
          <FileIcon />
          <div>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">{currentFileName}</p>
            <p className="text-sm text-zinc-500">Click or drop to replace</p>
          </div>
        </>
      ) : (
        <>
          <UploadIcon />
          <div>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              Drop your file here or click to browse
            </p>
            <p className="text-sm text-zinc-500">Supports .xlsx, .xls, .csv</p>
          </div>
        </>
      )}
    </div>
  );
};

const UploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const FileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
