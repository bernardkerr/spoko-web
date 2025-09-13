// $ref resolver utilities for docs and blobs via the adapter
import { store } from "./adapter";

export async function resolveRef(ref) {
  if (!ref || typeof ref !== "string") return null;
  if (ref.startsWith("sha256-")) {
    return await store.getBlob(ref);
  }
  if (ref.startsWith("spoke://docs/") || ref.startsWith("spoke://types/")) {
    return await store.getDoc(ref);
  }
  // TODO: support relative/intra-doc refs like "#/path" if needed by caller
  return null;
}

export async function safeGetDoc(id) {
  try { return await store.getDoc(id); } catch { return null; }
}

export async function listDocs(prefix = "") {
  return await store.listDocHeaders(prefix);
}
