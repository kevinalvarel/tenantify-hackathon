"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  registerSchema,
  type TRegisterSchema,
} from "@/validations/auth-validation";
import { signUp } from "@/servers/auth-server";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: TRegisterSchema) => {
    try {
      const response = await signUp(data);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push("/dashboard/association");
      router.refresh();
    } catch {
      toast.error("Terjadi kendala jaringan saat mencoba mendaftar.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            Daftarkan Kepengurusan Paguyuban UMKM
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            Buat akun pengurus untuk mengelola pedagang, zona, dan okupansi
            paguyuban Anda.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="name">Nama Paguyuban UMKM</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Contoh: Paguyuban UMKM Cilegon Juare"
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="johndoe@example.com"
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email ? (
            <FieldError>{errors.email.message}</FieldError>
          ) : (
            <FieldDescription>
              Email ini dipakai untuk masuk dan dihubungi pengelola.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="password"
              type={isVisible ? "text" : "password"}
              placeholder="••••••••"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsVisible((prev) => !prev)}
                aria-label={
                  isVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
                title={
                  isVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
              >
                {isVisible ? (
                  <EyeOffIcon className="size-3.5" />
                ) : (
                  <EyeIcon className="size-3.5" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">
            Konfirmasi Kata Sandi
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="confirmPassword"
              type={isVisible ? "text" : "password"}
              placeholder="••••••••"
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsVisible((prev) => !prev)}
                aria-label={
                  isVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
                title={
                  isVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
              >
                {isVisible ? (
                  <EyeOffIcon className="size-3.5" />
                ) : (
                  <EyeIcon className="size-3.5" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          )}
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Mendaftarkan...
              </>
            ) : (
              "Daftarkan Paguyuban"
            )}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Sudah punya akun pengurus?{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Masuk ke dashboard
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
