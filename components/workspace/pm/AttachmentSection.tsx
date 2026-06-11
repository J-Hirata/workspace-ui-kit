"use client";

/**
 * P4 添付（画像 / PDF）セクション。
 *
 * 入力3方式:
 *   1. 枠クリック → ファイル選択ダイアログ
 *   2. ドラッグ&ドロップ
 *   3. 枠クリック（フォーカス）→ Ctrl+V でクリップボード画像を貼り付け
 *
 * データは dataURL でメモリ上に保持する（v1.1 は永続化なし。
 * リロードで消えるのは既知の制限で、永続化は次回課題）。
 */

import { useRef, useState } from "react";
import { FileText, ImagePlus, X } from "lucide-react";

import { type PmAttachment } from "@/lib/pm-schema";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

function isAccepted(file: File) {
  return ACCEPTED_TYPES.includes(file.type);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** data: URL のまま新規タブで開くとブロックされるため Blob URL に変換して開く */
async function openInNewTab(dataUrl: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
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

  const addFiles = async (files: File[]) => {
    const accepted = files.filter(isAccepted);
    if (accepted.length === 0) return;

    const added: PmAttachment[] = await Promise.all(
      accepted.map(async (file, i) => ({
        id: `att-${Date.now()}-${i}`,
        name: file.name || `貼り付け-${new Date().toLocaleString("ja-JP")}.png`,
        mimeType: file.type,
        dataUrl: await readAsDataUrl(file),
      })),
    );
    onChange([...attachments, ...added]);
  };

  const removeAttachment = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  const images = attachments.filter((a) => a.mimeType.startsWith("image/"));
  const pdfs = attachments.filter((a) => a.mimeType === "application/pdf");

  return (
    <div className="flex flex-col gap-2">
      {/* 入力枠（クリック / D&D / Ctrl+V） */}
      <div
        role="button"
        tabIndex={0}
        aria-label="画像・PDF を追加（クリックで選択、ドラッグ&ドロップ、Ctrl+V 貼り付け）"
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
          クリックで選択 / ドラッグ&ドロップ
          <br />
          クリック後 <span className="font-bold">Ctrl+V</span> で貼り付け
        </p>
        <p className="text-[10px] text-muted-foreground/70">
          JPEG・PNG・GIF・WebP・PDF
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          void addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {/* 画像サムネイル */}
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
                  {/* eslint-disable-next-line @next/next/no-img-element -- dataURL のためnext/image不可 */}
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="h-16 w-full object-cover"
                  />
                </button>
              ) : (
                <div
                  className="flex h-16 w-full items-center justify-center rounded border border-border bg-muted px-1 text-center text-[9px] text-muted-foreground"
                  title={`${img.name}（実データなし）`}
                >
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

      {/* PDF チップ */}
      {pdfs.length > 0 && (
        <ul className="space-y-1">
          {pdfs.map((pdf) => (
            <li key={pdf.id} className="group relative">
              <button
                type="button"
                disabled={!pdf.dataUrl}
                onClick={() => pdf.dataUrl && void openInNewTab(pdf.dataUrl)}
                aria-label={`${pdf.name} を別タブで開く`}
                className="flex w-full items-center gap-1.5 rounded border border-border bg-card px-2 py-1.5 text-left text-[11px] hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText className="size-3.5 shrink-0 text-red-500" aria-hidden />
                <span className="truncate">{pdf.name}</span>
              </button>
              <button
                type="button"
                onClick={() => removeAttachment(pdf.id)}
                aria-label={`${pdf.name} を削除`}
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

      {/* 画像プレビュー */}
      <Dialog open={preview !== null} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-auto">
          <DialogHeader>
            <DialogTitle className="truncate">{preview?.name}</DialogTitle>
            <DialogDescription>
              Esc キーまたは右上 × で閉じます。
            </DialogDescription>
          </DialogHeader>
          {preview?.dataUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- dataURL のためnext/image不可
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
