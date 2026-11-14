"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  BookmarkPlus,
  Check,
  CheckCircle2,
  LogOut,
  Search,
  UserRound,
  X,
  Store,
  ArrowRight,
  UtensilsCrossed,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import CodeSlots, {
  type CodeSlotsStatus,
} from "@/components/customer/ui/number-slots";
import { useSession } from "@/lib/auth/auth-client";
import { logout } from "@/servers/auth-server";
import { useCustomer } from "@/context/customer-context";
import { QrScanDialog } from "@/components/customer/qr-scan-dialog";
import type { ActiveUmkm } from "@/types/customer";

const SAVED_KEY = "tenantify:join:saved";
const STORAGE_EVENT = "tenantify:join:storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

function useStored(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

function parse<T>(raw: string | null): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Browser dapat memblokir localStorage (mis. mode privat).
  }
}

export function JoinForm({
  defaultValue = "",
  initialStatus = "idle",
  detectedUmkm = null,
  error = null,
}: {
  defaultValue?: string;
  initialStatus?: CodeSlotsStatus;
  detectedUmkm?: ActiveUmkm | null;
  error?: string | null;
}) {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const { activeUmkm, setActiveUmkm } = useCustomer();
  const [code, setCode] = useState(defaultValue);
  const [status, setStatus] = useState<CodeSlotsStatus>(initialStatus);
  const [loggingOut, setLoggingOut] = useState(false);

  const savedRaw = useStored(SAVED_KEY);
  const saved = useMemo(
    () => parse<ActiveUmkm[]>(savedRaw) ?? [],
    [savedRaw],
  );

  const isLoggedIn = !!session?.user;

  // Auto-connect when a valid UMKM is detected from search params
  useEffect(() => {
    if (detectedUmkm) {
      setActiveUmkm(detectedUmkm);
    }
  }, [detectedUmkm, setActiveUmkm]);

  const isSaved =
    !!detectedUmkm && saved.some((item) => item.code === detectedUmkm.code);

  const updateSaved = (next: ActiveUmkm[]) => writeStorage(SAVED_KEY, next);

  const save = () => {
    if (!detectedUmkm || isSaved) return;
    updateSaved([...saved, detectedUmkm]);
    toast.success("UMKM / Paguyuban tersimpan di akun.");
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    const response = await logout();
    setLoggingOut(false);
    if (!response.success) {
      toast.error(response.message);
      return;
    }
    toast.success(response.message);
    await refetch();
    router.refresh();
  };

  const handleGoToMenu = () => {
    if (detectedUmkm) {
      setActiveUmkm(detectedUmkm);
      toast.success(`Menampilkan menu ${detectedUmkm.name}`);
    }
    router.push("/customer");
  };

  const handleSelectSaved = (savedCode: string) => {
    setCode(savedCode);
    router.push(`/join?code=${savedCode}`);
  };

  const handleScanResult = (scannedCode: string) => {
    setCode(scannedCode);
    router.push(`/join?code=${encodeURIComponent(scannedCode)}#hasil`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* User Info Bar if Logged In */}
      {!isPending && isLoggedIn && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <UserRound className="size-4 shrink-0 text-[#c85a32]" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {session.user.name}
              </p>
              <p className="truncate text-[11px] text-neutral-500">
                {session.user.email}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1 text-xs h-7"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut className="size-3.5" />
            {loggingOut ? "Keluar..." : "Keluar"}
          </Button>
        </div>
      )}

      {/* Info UMKM Aktif Saat Ini (jika sudah ada sebelumnya) */}
      {activeUmkm && !detectedUmkm && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-[#c85a32]/30 bg-[#c85a32]/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Store className="size-4 text-[#c85a32] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#c85a32]">
                Saat Ini Terhubung
              </p>
              <p className="text-xs font-extrabold text-neutral-900 dark:text-white truncate">
                {activeUmkm.name} ({activeUmkm.code})
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => router.push("/customer")}
            className="rounded-full text-xs font-semibold h-7 px-3 bg-[#c85a32] hover:bg-[#b34a24] text-white shrink-0"
          >
            Buka Menu
          </Button>
        </div>
      )}

      {/* Input Form Kode Unik */}
      <form action="/join" method="get" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
            Masukkan 6 Digit Kode Unik
          </Label>
          <span className="text-[11px] text-neutral-400">Kode 6 digit stan / paguyuban</span>
        </div>

        <div className="flex justify-center py-2">
          <CodeSlots
            id="code"
            length={6}
            value={code}
            onChange={(next) => {
              setCode(next.toUpperCase());
              setStatus("idle");
            }}
            status={status}
            alphanumeric
            ariaLabel="Kode unik UMKM"
            accentColor="#c85a32"
            inkColor="#c85a32"
            slotColor="var(--muted)"
            digitColor="var(--foreground)"
            dangerColor="var(--destructive)"
            slotSize={42}
            gap={8}
            radius={12}
            mask={false}
            caret
            autoFocus
          />
        </div>
        <input type="hidden" name="code" value={code} />

        <div className="flex flex-col gap-2 sm:flex-row">
          <QrScanDialog onResult={handleScanResult} />
          <Button
            type="submit"
            className="w-full sm:flex-1 gap-2 h-11 rounded-2xl font-bold bg-[#c85a32] hover:bg-[#b34a24] text-white shadow-md shadow-[#c85a32]/20 text-sm cursor-pointer active:scale-[0.99] transition-all"
            disabled={code.length !== 6}
          >
            <Search className="size-4" />
            <span>Deteksi & Buka Menu UMKM</span>
          </Button>
        </div>
      </form>

      {/* HASIL DETEKSI UMKM */}
      {detectedUmkm && (
        <div
          id="hasil"
          className="animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-3 rounded-2xl border border-emerald-600/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  UMKM / Paguyuban Terdeteksi
                </p>
                <h2 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                  {detectedUmkm.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold py-0 border-none">
                    {detectedUmkm.type === "paguyuban" ? "Paguyuban" : "Stan UMKM"}
                  </Badge>
                  <span className="font-mono font-bold text-[#c85a32]">
                    Kode: {detectedUmkm.code}
                  </span>
                  {detectedUmkm.location && (
                    <span className="flex items-center gap-1 text-neutral-500">
                      <MapPin className="size-3" />
                      {detectedUmkm.location}
                    </span>
                  )}
                </div>
                {detectedUmkm.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    {detectedUmkm.description}
                  </p>
                )}
              </div>
            </div>

            {isLoggedIn && (
              <Button
                type="button"
                size="sm"
                variant={isSaved ? "secondary" : "default"}
                className="shrink-0 gap-1 text-xs h-7 rounded-full"
                onClick={save}
                disabled={isSaved}
              >
                {isSaved ? (
                  <Check className="size-3" />
                ) : (
                  <BookmarkPlus className="size-3" />
                )}
                <span>{isSaved ? "Tersimpan" : "Simpan"}</span>
              </Button>
            )}
          </div>

          {/* Tombol Utama: Buka Menu */}
          <Button
            type="button"
            onClick={handleGoToMenu}
            className="w-full h-11 rounded-xl bg-[#c85a32] hover:bg-[#b34a24] text-white font-bold text-sm gap-2 shadow-lg shadow-[#c85a32]/25 cursor-pointer mt-1"
          >
            <UtensilsCrossed className="size-4" />
            <span>Buka Menu & Mulai Pesan</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Pesan Error jika tidak ditemukan */}
      {error && (
        <div
          role="alert"
          className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed"
        >
          {error}
        </div>
      )}

      {/* Daftar Tersimpan jika login */}
      {isLoggedIn && saved.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            UMKM / Paguyuban Tersimpan:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {saved.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2.5 bg-neutral-50/50 dark:bg-neutral-900/50"
              >
                <button
                  type="button"
                  onClick={() => handleSelectSaved(item.code)}
                  className="flex items-center gap-2 min-w-0 text-left hover:text-[#c85a32] transition-colors cursor-pointer"
                >
                  <Store className="size-4 text-[#c85a32] shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-neutral-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="font-mono text-[10px] text-neutral-500">
                      {item.code} • {item.location || "Lokasi Bazaar"}
                    </p>
                  </div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Hapus ${item.name}`}
                  onClick={() =>
                    updateSaved(saved.filter((entry) => entry.code !== item.code))
                  }
                  className="shrink-0 text-neutral-400 hover:text-red-500"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
