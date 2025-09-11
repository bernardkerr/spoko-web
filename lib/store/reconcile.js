// Reconcile site definitions into the local store on startup.
// Overwrites site-origin docs/types whose defSig changed; never overwrites user-origin docs.

import { store } from "./adapter";
import { buildManifest, computeDefSig } from "./manifest";

export async function reconcileStore() {
  try {
    const prev = (await store.getMeta("siteManifest")) || { manifestHash: null };
    const manifest = await buildManifest();
    if (prev.manifestHash === manifest.manifestHash) return { changed: false };

    // Seed/overwrite site docs
    for (const entry of manifest.docs) {
      const { $id, doc } = entry;
      const existing = await store.getDoc($id);
      const origin = existing?.meta?.origin || doc?.meta?.origin || "site";
      if (!existing) {
        const defSig = entry.defSig || computeDefSig(doc);
        await store.putDoc({ ...doc, meta: { ...(doc.meta || {}), origin: "site", defSig, updatedAt: new Date().toISOString(), version: 1 } });
        continue;
      }
      if (origin === "site") {
        const oldSig = existing?.meta?.defSig;
        const newSig = entry.defSig || computeDefSig(doc);
        if (oldSig !== newSig) {
          const version = (existing.meta?.version || 0) + 1;
          await store.putDoc({ ...doc, meta: { ...(existing.meta || {}), origin: "site", defSig: newSig, updatedAt: new Date().toISOString(), version } });
        }
      }
      // origin === "user" -> never overwrite
    }

    // Seed blobs if listed (no fetch by default; could fetch if url provided)
    for (const b of manifest.blobs) {
      const has = await store.hasBlob(b.hash);
      if (!has && b.data instanceof Blob) {
        await store.putBlob(b.hash, b.data, { mime: b.mime, size: b.data.size, filename: b.filename });
      }
      // If url is provided and data missing, a future enhancement can fetch lazily.
    }

    await store.setMeta("siteManifest", { manifestHash: manifest.manifestHash, at: new Date().toISOString() });
    try { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("store:reconciled", { detail: { manifestHash: manifest.manifestHash } })); } catch {}
    return { changed: true };
  } catch (e) {
    // Non-fatal: avoid blocking app if storage is unavailable
    console.warn("[reconcile] failed:", e);
    return { changed: false, error: String(e) };
  }
}
