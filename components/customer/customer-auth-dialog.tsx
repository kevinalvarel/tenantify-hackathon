"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { loginSchema, registerSchema } from "@/validations/auth-validation";
import { signIn, signUpCustomer } from "@/servers/auth-server";
import { useSession } from "@/lib/auth/auth-client";

type Mode = "sign-in" | "sign-up";
type FieldName = "name" | "email" | "password" | "confirmPassword";
type Errors = Partial<Record<FieldName, string>>;

const emptyValues: Record<FieldName, string> = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function toErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const next: Errors = {};
  for (const issue of issues) {
    const key = issue.path[0] as FieldName;
    if (key && !next[key]) next[key] = issue.message;
  }
  return next;
}

export type CustomerAuthDialogProps = {
  trigger?: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  autoOpen?: boolean;
  callbackUrl?: string;
};

export function CustomerAuthDialog({
  trigger,
  className,
  variant,
  autoOpen = false,
  callbackUrl,
}: CustomerAuthDialogProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { refetch } = useSession();
  const [open, setOpen] = useState(autoOpen);
  const [mode, setMode] = useState<Mode>("sign-in");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState(emptyValues);

  const isSignUp = mode === "sign-up";

  const update =
    (key: FieldName) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [key]: event.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setErrors({});
    setLoading(true);
    try {
      const response = isSignUp
        ? await signUpCustomer(registerSchema.parse(values))
        : await signIn(loginSchema.parse(values));

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      setValues(emptyValues);
      await refetch();
      setOpen(false);
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (pathname.includes("/auth")) {
        router.push("/profile");
      }
      router.refresh();
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        setErrors(
          toErrors(
            (error as { issues: { path: PropertyKey[]; message: string }[] })
              .issues,
          ),
        );
        return;
      }
      toast.error("Terjadi kendala jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setErrors({});
      }}
    >
      {!autoOpen && (
        <DialogTrigger
          render={
            trigger ? (
              (trigger as React.ReactElement)
            ) : (
              <Button
                type="button"
                variant={variant || "default"}
                size="sm"
                className={cn(
                  "h-9 sm:h-10 px-3 sm:px-3.5 2xl:px-4 rounded-full font-semibold text-xs sm:text-[13px] gap-1.5 shrink-0 bg-[#c85a32] hover:bg-[#b34a24] text-white shadow-sm transition-all duration-200 cursor-pointer active:scale-95",
                  className,
                )}
              />
            )
          }
        >
          <LogIn className="size-3.5 sm:size-4 shrink-0" />
          <span>
            Masuk<span className="hidden 2xl:inline"> / Daftar</span>
          </span>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSignUp ? "Daftar sebagai Pembeli" : "Masuk sebagai Pembeli"}
          </DialogTitle>
          <DialogDescription>
            {isSignUp
              ? "Buat akun untuk menyimpan asosiasi dan memesan dari tenant favoritmu."
              : "Masuk untuk menyimpan beberapa asosiasi dan melihat pesananmu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            {isSignUp && (
              <Field>
                <FieldLabel htmlFor="customer-name">Nama</FieldLabel>
                <Input
                  id="customer-name"
                  value={values.name}
                  onChange={update("name")}
                  placeholder="Nama lengkap"
                  disabled={loading}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="customer-email">Email</FieldLabel>
              <Input
                id="customer-email"
                type="email"
                value={values.email}
                onChange={update("email")}
                placeholder="johndoe@example.com"
                disabled={loading}
                aria-invalid={!!errors.email}
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="customer-password">Kata Sandi</FieldLabel>
              <Input
                id="customer-password"
                type="password"
                value={values.password}
                onChange={update("password")}
                placeholder="••••••••"
                disabled={loading}
                aria-invalid={!!errors.password}
              />
              {errors.password && <FieldError>{errors.password}</FieldError>}
            </Field>

            {isSignUp && (
              <Field>
                <FieldLabel htmlFor="customer-confirm">
                  Konfirmasi Kata Sandi
                </FieldLabel>
                <Input
                  id="customer-confirm"
                  type="password"
                  value={values.confirmPassword}
                  onChange={update("confirmPassword")}
                  placeholder="••••••••"
                  disabled={loading}
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword}</FieldError>
                )}
              </Field>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  {isSignUp ? "Mendaftarkan..." : "Memproses..."}
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus className="size-4" />
                  Daftar
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </FieldGroup>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {isSignUp ? "Sudah punya akun? " : "Belum punya akun? "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={() => switchMode(isSignUp ? "sign-in" : "sign-up")}
          >
            {isSignUp ? "Masuk" : "Daftar"}
          </Button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
