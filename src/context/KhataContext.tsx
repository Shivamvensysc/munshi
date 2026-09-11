import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import { khataService } from "../services";
import { tokenStore } from "../auth/tokenStore";
import type { ApiError } from "../lib/apiClient";

export interface Khata {
  id: string;
  name: string;
  description?: string | null;
}

interface KhataContextValue {
  /** All khatas belonging to the logged-in user. */
  khatasList: Khata[];
  /** True while the initial (or a manual) khata list fetch is in flight. */
  isLoadingKhatas: boolean;
  /** Id of the currently active khata, or null if none selected yet. */
  selectedKhataId: string | null;
  /** Convenience lookup of the full khata object for selectedKhataId. */
  selectedKhata: Khata | null;
  /** Switch the active khata everywhere in the app (header + every page). */
  selectKhata: (id: string, name?: string) => void;
  /** Re-fetch the khata list from the server (e.g. after login). */
  refetchKhatas: () => Promise<void>;
  /** Push a freshly created khata into the shared list and select it. */
  addKhata: (khata: Khata) => void;
  /** Patch a khata already in the shared list (after a successful PUT /khatas/:id). */
  updateKhata: (id: string, patch: { name?: string; description?: string | null }) => void;
  /** Remove a khata from the shared list (after a successful DELETE /khatas/:id),
   *  automatically re-selecting another khata if the deleted one was active. */
  removeKhata: (id: string) => void;
}

const KhataContext = createContext<KhataContextValue | undefined>(undefined);

export function KhataProvider({ children }: { children: ReactNode }) {
  const [khatasList, setKhatasList] = useState<Khata[]>(tokenStore.getKhatas());
  const [isLoadingKhatas, setIsLoadingKhatas] = useState(true);

  // Single, reactive source of truth for the active khata. Every component
  // that reads this via useKhata() re-renders (and can re-fetch its own
  // data) the instant it changes — unlike reading tokenStore.getKhataId()
  // directly, which is a plain module variable React has no way to observe.
  const [selectedKhataId, setSelectedKhataId] = useState<string | null>(
    () => tokenStore.getKhataId() || null
  );

  const selectKhata = useCallback((id: string, name?: string) => {
    setSelectedKhataId(id);
    tokenStore.setKhataId(id);
    if (name) {
      tokenStore.setDefaultKhata({ id, name });
    }
  }, []);

  const fetchKhatas = useCallback(async () => {
    setIsLoadingKhatas(true);
    try {
      const data = await khataService.list();

      if (data.success && Array.isArray(data.data)) {
        const mapped: Khata[] = data.data.map((k) => ({
          id: k.khata_id,
          name: k.khata_name,
          description: k.description,
        }));
        setKhatasList(mapped);
        tokenStore.setKhatas(mapped);

        if (mapped.length > 0) {
          setSelectedKhataId((current) => {
            const stillExists = mapped.some((k) => k.id === current);
            const active = stillExists ? mapped.find((k) => k.id === current)! : mapped[0];
            tokenStore.setKhataId(active.id);
            tokenStore.setDefaultKhata(active);
            return active.id;
          });
        }
      } else {
        toast.error(data.message || "Failed to load Khatas.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Fetch Khatas Error:", error);
      toast.error(apiError.message || "Unable to load your Khatas.");
    } finally {
      setIsLoadingKhatas(false);
    }
  }, []);

  useEffect(() => {
    fetchKhatas();
  }, [fetchKhatas]);

  const addKhata = useCallback((khata: Khata) => {
    setKhatasList((prev) => {
      const updated = [...prev, khata];
      tokenStore.setKhatas(updated);
      return updated;
    });
    selectKhata(khata.id, khata.name);
  }, [selectKhata]);

  // Called after a successful PUT /khatas/:id — patches the shared list (and
  // the header's/every page's view of it) without needing a full re-fetch.
  const updateKhata = useCallback(
    (id: string, patch: { name?: string; description?: string | null }) => {
      setKhatasList((prev) => {
        const updated = prev.map((k) => (k.id === id ? { ...k, ...patch } : k));
        tokenStore.setKhatas(updated);
        return updated;
      });
      if (id === selectedKhataId && patch.name) {
        tokenStore.setDefaultKhata({ id, name: patch.name });
      }
    },
    [selectedKhataId]
  );

  // Called after a successful DELETE /khatas/:id — removes it from the
  // shared list and, if it was the active khata, falls back to whichever
  // khata is now first in the list (or clears selection if none remain).
  const removeKhata = useCallback(
    (id: string) => {
      setKhatasList((prev) => {
        const updated = prev.filter((k) => k.id !== id);
        tokenStore.setKhatas(updated);

        if (id === selectedKhataId) {
          if (updated.length > 0) {
            const next = updated[0];
            setSelectedKhataId(next.id);
            tokenStore.setKhataId(next.id);
            tokenStore.setDefaultKhata(next);
          } else {
            setSelectedKhataId(null);
            tokenStore.setKhataId("");
          }
        }

        return updated;
      });
    },
    [selectedKhataId]
  );

  const selectedKhata = useMemo(
    () => khatasList.find((k) => k.id === selectedKhataId) || null,
    [khatasList, selectedKhataId]
  );

  const value = useMemo<KhataContextValue>(
    () => ({
      khatasList,
      isLoadingKhatas,
      selectedKhataId,
      selectedKhata,
      selectKhata,
      refetchKhatas: fetchKhatas,
      addKhata,
      updateKhata,
      removeKhata,
    }),
    [
      khatasList,
      isLoadingKhatas,
      selectedKhataId,
      selectedKhata,
      selectKhata,
      fetchKhatas,
      addKhata,
      updateKhata,
      removeKhata,
    ]
  );

  return <KhataContext.Provider value={value}>{children}</KhataContext.Provider>;
}

export function useKhata(): KhataContextValue {
  const ctx = useContext(KhataContext);
  if (!ctx) {
    throw new Error("useKhata must be used within a KhataProvider");
  }
  return ctx;
}
