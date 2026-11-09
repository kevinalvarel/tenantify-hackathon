"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
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
import {
  loginSchema,
  registerSchema,
} from "@/validations/auth-validation";
import { signIn, signUpCustomer } from "@/servers/auth-server";

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

export function CustomerAuthDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("sign-in");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState(emptyValues);

  const isSignUp = mode === "sign-up";

  const update = (key: FieldName) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
      setOpen(false);
      router.push("/customer");
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
      <DialogTrigger
        render={
          <Button type="button" size="sm" className="shrink-0 gap-1 text-xs" />
        }
      >
        <LogIn className="size-3.5" />
        Masuk / Daftar
      </DialogTrigger>
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
