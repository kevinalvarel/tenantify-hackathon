"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  BookmarkPlus,
  Check,
  CheckCircle2,
  LogIn,
  LogOut,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CodeSlots, {
  type CodeSlotsStatus,
} from "@/components/customer/ui/number-slots";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth/auth-client";
import { logout } from "@/servers/auth-server";

type Association = { code: string; name: string };

const GUEST_KEY = "tenantify:join:guest";
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
  association = null,
  error = null,
}: {
  defaultValue?: string;
  initialStatus?: CodeSlotsStatus;
  association?: Association | null;
  error?: string | null;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [code, setCode] = useState(defaultValue);
  const [status, setStatus] = useState<CodeSlotsStatus>(initialStatus);
  const [loggingOut, setLoggingOut] = useState(false);
  const guestRaw = useStored(GUEST_KEY);
  const savedRaw = useStored(SAVED_KEY);
  const guest = useMemo(() => parse<Association>(guestRaw), [guestRaw]);
  const saved = useMemo(
    () => parse<Association[]>(savedRaw) ?? [],
    [savedRaw],
  );

  const isLoggedIn = !!session?.user;

  useEffect(() => {
    if (isPending || isLoggedIn || !association) return;
    if (guest?.code === association.code) return;
    writeStorage(GUEST_KEY, association);
  }, [isPending, isLoggedIn, association, guest]);

  // shortcut: batas 1 kode tamu hanya di klien, ?code= manual masih bisa lookup — pindahkan ke server saat sesi sudah ada
  const locked = !isPending && !isLoggedIn && guest !== null;
  const shown = association ?? (locked ? guest : null);
  const activeCode = locked && guest ? guest.code : code;
  const isSaved =
    !!association && saved.some((item) => item.code === association.code);

  const updateSaved = (next: Association[]) => writeStorage(SAVED_KEY, next);

  const save = () => {
    if (!association || isSaved) return;
    updateSaved([...saved, association]);
    toast.success("Asosiasi disimpan.");
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
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {!isPending &&
        (isLoggedIn ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <UserRound className="size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">
                  {session.user.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1 text-xs"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="size-3.5" />
              {loggingOut ? "Keluar..." : "Keluar"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Masuk untuk menyimpan beberapa asosiasi.
            </p>
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0 gap-1 text-xs"
                  />
                }
              >
                <LogIn className="size-3.5" />
                Masuk
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Masuk sebagai Pembeli</DialogTitle>
                  <DialogDescription>
                    Fitur masuk pembeli akan tersedia pada iterasi berikutnya.
                    Sementara ini kamu tetap bisa mencari 1 kode pengelola
                    tanpa akun.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose
                    render={<Button type="button" variant="secondary" />}
                  >
                    Mengerti
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ))}

      <form action="/join" method="get" className="flex flex-col gap-3">
        <Label htmlFor="code">Kode Pengelola</Label>
        <div className="flex justify-center">
          <CodeSlots
            id="code"
            length={6}
            value={activeCode}
            onChange={(next) => {
              setCode(next);
              setStatus("idle");
            }}
            readOnly={locked}
            status={status}
            alphanumeric
            ariaLabel="Kode pengelola"
            accentColor="var(--primary)"
            inkColor="var(--primary)"
            slotColor="var(--muted)"
            digitColor="var(--primary-foreground)"
            dangerColor="var(--destructive)"
            slotSize={36}
            gap={6}
            radius={10}
            mask={false}
            caret
            autoFocus={!locked}
          />
        </div>
        <input type="hidden" name="code" value={activeCode} />
        <Button
          type="submit"
          className="w-full gap-1.5"
          disabled={locked || code.length !== 6}
        >
          <Search className="size-4" />
          Cari Pengelola
        </Button>
      </form>

      {shown && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-600/30 bg-emerald-600/10 p-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {association ? "Pengelola ditemukan" : "Kode tersimpan"}
            </p>
            <p className="font-semibold">{shown.name}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {shown.code}
            </p>
          </div>
          {isLoggedIn && association && (
            <Button
              type="button"
              size="sm"
              variant={isSaved ? "secondary" : "default"}
              className="shrink-0 gap-1 text-xs"
              onClick={save}
              disabled={isSaved}
            >
              {isSaved ? (
                <Check className="size-3.5" />
              ) : (
                <BookmarkPlus className="size-3.5" />
              )}
              {isSaved ? "Tersimpan" : "Simpan"}
            </Button>
          )}
        </div>
      )}

      {locked && (
        <p className="text-xs text-muted-foreground">
          Kamu sudah memakai 1 kode gratis di browser ini. Masuk untuk
          menyimpan dan mencari kode pengelola lain.
        </p>
      )}

      {isLoggedIn && saved.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Asosiasi tersimpan
          </p>
          <ul className="flex flex-col gap-1.5">
            {saved.map((item) => (
              <li
                key={item.code}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{item.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {item.code}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Hapus ${item.name}`}
                  onClick={() =>
                    updateSaved(
                      saved.filter((entry) => entry.code !== item.code),
                    )
                  }
                >
                  <X className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
