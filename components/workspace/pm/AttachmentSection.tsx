"use client";

/**
 * P4 添付セクション（ファイル + ローカルパスリンク）。
 * ファイルは DB に dataUrl 保存。パスは文字列のみ保存。
 */

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Copy,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  ImagePlus,
  X,
} from "lucide-react";

import { type PmAttachment } from "@/lib/pm-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
];

const ACCEPTED_EXTENSIONS = ["xlsx", "xls", "csv", "txt"];

function isAccepted(file: File) {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(ext ?? "");
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function openInNewTab(dataUrl: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
}

function fileNameFromPath(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || path;
}

type AttachmentSectionProps = {
  attachments: PmAttachment[];
  onChange: (next: PmAttachment[]) => void;
};

export function AttachmentSection({
  attachments,
  onChange,
}: AttachmentSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<PmAttachment | null>(null);
  const [pathDialogOpen, setPathDialogOpen] = useState(false);
  const [pathInput, setPathInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const stateRef = useRef({ attachments, onChange });
  stateRef.current = { attachments, onChange };

  const addFiles = async (files: File[]) => {
    const accepted = files.filter(isAccepted);
    if (accepted.length === 0) return;

    const added: PmAttachment[] = await Promise.all(
      accepted.map(async (file, i) => ({
        id: `att-${Date.now()}-${i}`,
        name: file.name || `貼り付け-${new Date().toLocaleString("ja-JP")}.png`,
        mimeType: file.type || "application/octet-stream",
        kind: "file" as const,
        dataUrl: await readAsDataUrl(file),
      })),
    );
    const current = stateRef.current;
    current.onChange([...current.attachments, ...added]);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length === 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable=true]")) return;
      e.preventDefault();
      void addFiles(files);
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeAttachment = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  const addPath = () => {
    const trimmed = pathInput.trim();
    if (!trimmed) return;
    const entry: PmAttachment = {
      id: `path-${Date.now()}`,
      name: fileNameFromPath(trimmed),
      mimeType: "text/x-file-path",
      kind: "path",
      path: trimmed,
    };
    onChange([...attachments, entry]);
    setPathInput("");
    setPathDialogOpen(false);
  };

  const copyPath = async (id: string, path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard 不可時は無視 */
    }
  };

  const fileAttachments = attachments.filter((a) => a.kind !== "path");
  const pathAttachments = attachments.filter((a) => a.kind === "path");

  const images = fileAttachments.filter((a) => a.mimeType.startsWith("image/"));
  const pdfs = fileAttachments.filter((a) => a.mimeType === "application/pdf");
  const spreadsheets = fileAttachments.filter(
    (a) =>
      a.mimeType.includes("spreadsheet") ||
      a.mimeType.includes("excel") ||
      a.mimeType === "text/csv" ||
      a.name.endsWith(".xlsx") ||
      a.name.endsWith(".xls") ||
      a.name.endsWith(".csv"),
  );
  const textFiles = fileAttachments.filter(
    (a) =>
      a.mimeType === "text/plain" ||
      a.name.endsWith(".txt"),
  );

  const acceptAttr = [
    ...ACCEPTED_TYPES,
    ...ACCEPTED_EXTENSIONS.map((e) => `.${e}`),
  ].join(",");

  return (
    <div className="flex flex-col gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm" className="w-full justify-between">
              追加
              <ChevronDown className="size-4 opacity-60" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-(--anchor-width)">
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            ファイルを追加
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPathDialogOpen(true)}>
            パスを貼る
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div
        role="button"
        tabIndex={0}
        aria-label="ファイルを追加（クリックで選択、ドラッグ&ドロップ、Ctrl+V 貼り付け）"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onPaste={(e) => {
          const files = Array.from(e.clipboardData.files);
          if (files.length > 0) {
            e.preventDefault();
            void addFiles(files);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-3 py-4 text-center transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:bg-muted/50",
        )}
      >
        <ImagePlus className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          クリック / D&D / Ctrl+V
        </p>
        <p className="text-[10px] text-muted-foreground/70">
          画像・PDF・Excel・CSV・txt
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => {
          void addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {pathAttachments.length > 0 && (
        <ul className="space-y-1">
          {pathAttachments.map((item) => (
            <li
              key={item.id}
              className="group flex items-start gap-1.5 rounded border border-border bg-card px-2 py-1.5"
            >
              <FolderOpen className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium">{item.name}</p>
                <p className="break-all text-[10px] text-muted-foreground">
                  {item.path}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`${item.name} のパスをコピー`}
                onClick={() => item.path && void copyPath(item.id, item.path)}
              >
                <Copy className="size-3" />
              </Button>
              {copiedId === item.id && (
                <span className="text-[9px] text-muted-foreground">コピー済</span>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(item.id)}
                aria-label={`${item.name} を削除`}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              {img.dataUrl ? (
                <button
                  type="button"
                  onClick={() => setPreview(img)}
                  aria-label={`${img.name} を拡大表示`}
                  className="block w-full cursor-zoom-in overflow-hidden rounded border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="h-16 w-full object-cover"
                  />
                </button>
              ) : (
                <div className="flex h-16 w-full items-center justify-center rounded border border-border bg-muted px-1 text-center text-[9px] text-muted-foreground">
                  {img.name.slice(0, 8)}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(img.id)}
                aria-label={`${img.name} を削除`}
                className="absolute -top-1.5 -right-1.5 hidden size-4 items-center justify-center rounded-full bg-foreground text-background shadow group-hover:flex"
              >
                <X className="size-3" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {[...pdfs, ...spreadsheets, ...textFiles].length > 0 && (
        <ul className="space-y-1">
          {[...pdfs, ...spreadsheets, ...textFiles].map((file) => (
            <li key={file.id} className="group relative">
              <button
                type="button"
                disabled={!file.dataUrl}
                onClick={() => file.dataUrl && void openInNewTab(file.dataUrl)}
                aria-label={`${file.name} を別タブで開く`}
                className="flex w-full items-center gap-1.5 rounded border border-border bg-card px-2 py-1.5 text-left text-[11px] hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {file.mimeType.includes("spreadsheet") ||
                file.mimeType.includes("excel") ||
                file.mimeType === "text/csv" ? (
                  <FileSpreadsheet className="size-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <FileText className="size-3.5 shrink-0 text-red-500" />
                )}
                <span className="truncate">{file.name}</span>
              </button>
              <button
                type="button"
                onClick={() => removeAttachment(file.id)}
                aria-label={`${file.name} を削除`}
                className="absolute -top-1.5 -right-1.5 hidden size-4 items-center justify-center rounded-full bg-foreground text-background shadow group-hover:flex"
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {attachments.length === 0 && (
        <p className="text-xs text-muted-foreground">添付なし</p>
      )}

      <Dialog open={pathDialogOpen} onOpenChange={setPathDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ローカルパスを貼る</DialogTitle>
            <DialogDescription>
              例: C:\Users\...\在庫.xlsx — ブラウザからは開けないため、コピーして使います。
            </DialogDescription>
          </DialogHeader>
          <Input
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="C:\Users\...\ファイル名.xlsx"
            aria-label="ファイルパス"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPathDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={addPath} disabled={!pathInput.trim()}>
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={preview !== null} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-auto">
          <DialogHeader>
            <DialogTitle className="truncate">{preview?.name}</DialogTitle>
            <DialogDescription>
              Esc キーまたは右上 × で閉じます。
            </DialogDescription>
          </DialogHeader>
          {preview?.dataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.dataUrl}
              alt={preview.name}
              className="h-auto w-full rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
