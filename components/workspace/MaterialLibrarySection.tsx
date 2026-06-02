"use client";

/**
 * Pane 4 下部: 候補者単位の仮想フォルダ + ファイル（IndexedDB）。
 * 選考スコアカードの `attachments`（JSON シード）とは独立。
 */

import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import {
  ChevronRight,
  Download,
  File as FileIcon,
  Folder as FolderIcon,
  Trash2,
} from "lucide-react";

import { Pane4Section } from "@/components/workspace/Pane4Section";
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
  PANE4_MATERIAL_LIBRARY,
  PANE4_SECTION_IDS,
} from "@/lib/labels";
import { MATERIAL_PERSISTENCE_MODE } from "@/lib/materials/persistence";
import type { MaterialFileRecord, MaterialState } from "@/lib/materials/types";
import {
  buildBreadcrumb,
  canDeleteFolder,
  deleteBlob,
  isFileInFolder,
  isFolderChildOf,
  loadBlob,
  loadMaterialState,
  saveBlob,
  saveMaterialState,
} from "@/lib/materials/indexedDbStore";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

type MaterialLibrarySectionProps = {
  candidateId: string;
};

export function MaterialLibrarySection({
  candidateId,
}: MaterialLibrarySectionProps) {
  const [state, setState] = useState<MaterialState>({
    folders: [],
    files: [],
  });
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [idbOk, setIdbOk] = useState(true);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (typeof indexedDB === "undefined") {
      startTransition(() => setIdbOk(false));
      return;
    }
    void loadMaterialState(candidateId).then((next) => {
      if (cancelled) return;
      startTransition(() => {
        setState(next);
        setIdbOk(true);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  useEffect(() => {
    startTransition(() => setCurrentFolderId(null));
  }, [candidateId]);

  const persist = useCallback(
    async (next: MaterialState) => {
      setState(next);
      await saveMaterialState(candidateId, next);
    },
    [candidateId],
  );

  const breadcrumb = buildBreadcrumb(state.folders, currentFolderId);

  const childFolders = state.folders.filter((f) =>
    isFolderChildOf(f, currentFolderId),
  );
  const childFiles = state.files.filter((f) =>
    isFileInFolder(f, currentFolderId),
  );

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    const id = crypto.randomUUID();
    const next: MaterialState = {
      ...state,
      folders: [
        ...state.folders,
        { id, parentId: currentFolderId, name },
      ],
    };
    await persist(next);
    setNewFolderName("");
    setFolderDialogOpen(false);
  };

  const handlePickFiles = () => fileInputRef.current?.click();

  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const list = e.target.files;
    e.target.value = "";
    if (!list?.length) return;
    const files = [...list];
    const nextFiles = [...state.files];
    for (const file of files) {
      const id = crypto.randomUUID();
      const rec: MaterialFileRecord = {
        id,
        folderId: currentFolderId,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        updatedAt: new Date().toISOString(),
      };
      nextFiles.push(rec);
      await saveBlob(candidateId, id, file);
    }
    await persist({ ...state, files: nextFiles });
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm("このファイルを削除しますか？")) return;
    await deleteBlob(candidateId, fileId);
    await persist({
      ...state,
      files: state.files.filter((f) => f.id !== fileId),
    });
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!canDeleteFolder(folderId, state)) return;
    if (!window.confirm("この空フォルダを削除しますか？")) return;
    await persist({
      ...state,
      folders: state.folders.filter((f) => f.id !== folderId),
    });
    if (currentFolderId === folderId) setCurrentFolderId(null);
  };

  const handleDownload = async (file: MaterialFileRecord) => {
    const blob = await loadBlob(candidateId, file.id);
    if (!blob) {
      window.alert("ファイルが見つかりません（ストレージが消えた可能性があります）。");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!idbOk) {
    return (
      <Pane4Section
        id={PANE4_SECTION_IDS.m2.materialLibrary}
        title={PANE4_MATERIAL_LIBRARY.title}
      >
        <p className="text-sm text-muted-foreground">
          この環境では IndexedDB が使えません。ブラウザで開き直してください。
        </p>
      </Pane4Section>
    );
  }

  return (
    <>
      <Pane4Section
        id={PANE4_SECTION_IDS.m2.materialLibrary}
        title={PANE4_MATERIAL_LIBRARY.title}
      >
        <p className="text-xs text-muted-foreground">
          {PANE4_MATERIAL_LIBRARY.footnote}{" "}
          <span className="font-mono text-[10px]">
            ({MATERIAL_PERSISTENCE_MODE})
          </span>
        </p>

        <nav
          className="flex flex-wrap items-center gap-0.5 text-xs text-muted-foreground"
          aria-label="フォルダ階層"
        >
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.id ?? "root"} className="flex items-center">
              {i > 0 && <ChevronRight className="mx-0.5 size-3 shrink-0" />}
              <Button
                type="button"
                variant={i === breadcrumb.length - 1 ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-1.5 text-xs"
                onClick={() => setCurrentFolderId(crumb.id)}
              >
                {crumb.name}
              </Button>
            </span>
          ))}
        </nav>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFolderDialogOpen(true)}
          >
            <FolderIcon className="mr-1 size-3.5" />
            {PANE4_MATERIAL_LIBRARY.newFolder}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePickFiles}
          >
            <FileIcon className="mr-1 size-3.5" />
            {PANE4_MATERIAL_LIBRARY.uploadFiles}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
          />
        </div>

        <ul className="flex flex-col gap-1 rounded-lg border border-border bg-card p-2 text-sm">
          {childFolders.length === 0 && childFiles.length === 0 ? (
            <li className="px-1 py-2 text-muted-foreground">
              {PANE4_MATERIAL_LIBRARY.emptyFolder}
            </li>
          ) : (
            <>
              {childFolders.map((folder) => (
                <li
                  key={folder.id}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    onClick={() => setCurrentFolderId(folder.id)}
                  >
                    <FolderIcon className="size-4 shrink-0 text-amber-600" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                  {canDeleteFolder(folder.id, state) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={`フォルダ ${folder.name} を削除`}
                      onClick={() => void handleDeleteFolder(folder.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </li>
              ))}
              {childFiles.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatBytes(file.sizeBytes)}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`${file.name} をダウンロード`}
                      onClick={() => void handleDownload(file)}
                    >
                      <Download className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`${file.name} を削除`}
                      onClick={() => void handleDeleteFile(file.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </span>
                </li>
              ))}
            </>
          )}
        </ul>
      </Pane4Section>

      <Dialog
        open={folderDialogOpen}
        onOpenChange={(open) => {
          setFolderDialogOpen(open);
          if (!open) setNewFolderName("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>フォルダを作成</DialogTitle>
            <DialogDescription>
              現在の位置:{" "}
              {breadcrumb[breadcrumb.length - 1]?.name ?? "ルート"}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="フォルダ名"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreateFolder();
            }}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFolderDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button type="button" onClick={() => void handleCreateFolder()}>
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
