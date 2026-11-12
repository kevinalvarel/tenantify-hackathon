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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { loginSchema, type TLoginSchema } from "@/validations/auth-validation";
import { signIn } from "@/servers/auth-server";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: TLoginSchema) => {
    try {
      setIsLoading(true);
      const response = await signIn(data);

      if (!response.success) {
        toast.error(response.message);
        setIsLoading(false);
        return;
      }

      toast.success(response.message);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Terjadi kendala jaringan saat mencoba masuk.");
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    toast.info(
      "Masuk dengan Google akan segera tersedia pada iterasi berikutnya.",
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Masuk ke Tenantify</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Masukan Email dan Kata Sandi Anda
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="johndoe@example.com"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="password"
              type={isVisible ? "text" : "password"}
              placeholder="••••••••"
              disabled={isLoading}
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </Field>

        <FieldSeparator>Atau lanjutkan dengan</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="w-full gap-2"
            onClick={handleGoogleClick}
            disabled={isLoading}
          >
            <FaGoogle />
            Masuk dengan Google
          </Button>
          <FieldDescription className="text-center">
            Belum Punya Akun?{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Daftar
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
