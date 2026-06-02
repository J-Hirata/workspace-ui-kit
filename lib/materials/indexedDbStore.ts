import type { MaterialFileRecord, MaterialFolder, MaterialState } from "./types";

const DB_NAME = "workspace-ui-kit-materials-v1";
const DB_VERSION = 1;
const META = "candidateMeta";
const BLOBS = "blobs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("indexedDB.open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META);
      }
      if (!db.objectStoreNames.contains(BLOBS)) {
        db.createObjectStore(BLOBS);
      }
    };
  });
}

function blobKey(candidateId: string, fileId: string): string {
  return `${candidateId}:${fileId}`;
}

const emptyState = (): MaterialState => ({ folders: [], files: [] });

export async function loadMaterialState(
  candidateId: string,
): Promise<MaterialState> {
  if (typeof indexedDB === "undefined") return emptyState();
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META, "readonly");
    const req = tx.objectStore(META).get(candidateId);
    req.onsuccess = () => {
      const raw = req.result;
      if (!raw || typeof raw !== "object") {
        resolve(emptyState());
        return;
      }
      resolve({
        folders: Array.isArray(raw.folders) ? raw.folders : [],
        files: Array.isArray(raw.files) ? raw.files : [],
      });
    };
    req.onerror = () => reject(req.error ?? new Error("get failed"));
  });
}

export async function saveMaterialState(
  candidateId: string,
  state: MaterialState,
): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META, "readwrite");
    tx.objectStore(META).put(state, candidateId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("put failed"));
  });
}

export async function saveBlob(
  candidateId: string,
  fileId: string,
  blob: Blob,
): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  const key = blobKey(candidateId, fileId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOBS, "readwrite");
    tx.objectStore(BLOBS).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("blob put failed"));
  });
}

export async function loadBlob(
  candidateId: string,
  fileId: string,
): Promise<Blob | undefined> {
  if (typeof indexedDB === "undefined") return undefined;
  const db = await openDb();
  const key = blobKey(candidateId, fileId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOBS, "readonly");
    const req = tx.objectStore(BLOBS).get(key);
    req.onsuccess = () => {
      const v = req.result;
      resolve(v instanceof Blob ? v : undefined);
    };
    req.onerror = () => reject(req.error ?? new Error("blob get failed"));
  });
}

export async function deleteBlob(
  candidateId: string,
  fileId: string,
): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  const key = blobKey(candidateId, fileId);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOBS, "readwrite");
    tx.objectStore(BLOBS).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("blob delete failed"));
  });
}

/** ルート相当の folderId 比較用（UI 状態は null、データ上も null で統一） */
export function isFileInFolder(
  file: MaterialFileRecord,
  currentFolderId: string | null,
): boolean {
  return file.folderId === currentFolderId;
}

export function isFolderChildOf(
  folder: MaterialFolder,
  parentId: string | null,
): boolean {
  return folder.parentId === parentId;
}

export function buildBreadcrumb(
  folders: MaterialFolder[],
  currentFolderId: string | null,
): { id: string | null; name: string }[] {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const chain: { id: string | null; name: string }[] = [
    { id: null, name: "ルート" },
  ];
  if (currentFolderId === null) return chain;
  const path: MaterialFolder[] = [];
  let cur: MaterialFolder | undefined = byId.get(currentFolderId);
  while (cur) {
    path.unshift(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return [{ id: null, name: "ルート" }, ...path.map((f) => ({ id: f.id, name: f.name }))];
}

export function canDeleteFolder(
  folderId: string,
  state: MaterialState,
): boolean {
  const hasChildFolder = state.folders.some((f) => f.parentId === folderId);
  const hasFile = state.files.some((f) => f.folderId === folderId);
  return !hasChildFolder && !hasFile;
}
