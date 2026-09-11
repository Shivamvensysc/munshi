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
        const mapped: Khata[] = data.data.map((k) => ({ id: k.khata_id, name: k.khata_name }));
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
    }),
    [khatasList, isLoadingKhatas, selectedKhataId, selectedKhata, selectKhata, fetchKhatas, addKhata]
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
