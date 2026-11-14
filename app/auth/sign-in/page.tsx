import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center font-semibold text-lg">
            <div className="flex size-10 items-center justify-center rounded-md">
              <Image
                src="/icons/tenantify.png"
                alt="Logo Tenantify"
                width={48}
                height={48}
                priority
              />
            </div>
            Tenant<span className="text-primary">ify</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative isolate lg:flex flex-col items-center justify-center p-12 text-center border-l border-border rounded-4xl">
        {/* Background image dengan opacity */}
        <div className="absolute inset-0 -z-10 bg-[url('/images/login.jpg')] bg-cover bg-center rounded-4xl" />
        <div className="absolute inset-0 -z-10 bg-secondary/70 rounded-4xl" />

        <div className="flex flex-col items-center max-w-md gap-6">
          <Image
            src="/icons/tenantify-text.png"
            alt="Tenantify Branding"
            width={240}
            height={70}
            className="h-auto w-auto"
            priority
          />

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              Satu Pintu untuk Pedagang dan Pengurus
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pedagang mengelola menu, stok, dan pesanan stan. Pengurus
              memantau tenant, zona, dan okupansi kawasan dari dashboard yang
              sama.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
