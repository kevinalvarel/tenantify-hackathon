"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AssociationTenant, BoothSlot } from "@/types/association";
import {
  registerSellerSchema,
  type TRegisterSellerSchema,
} from "@/validations/auth-validation";
import { createSellerWithTenantAction } from "@/servers/account-server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { SellerRegistrationHistory } from "@/components/association/register-seller/seller-registration-history";

const CATEGORIES = [
  "Makanan",
  "Minuman",
  "Kopi & Pastry",
  "Fashion",
  "Kerajinan",
];

type SellerCredentials = {
  tenantName: string;
  email: string;
  password: string;
};

type SellerRegistrationProps = {
  tenants: AssociationTenant[];
  booths: BoothSlot[];
  onAddTenant: (tenant: AssociationTenant) => void;
  onSelectTenant: (tenant: AssociationTenant) => void;
};

const zoneLabelFromCode = (zoneCode?: string) =>
  zoneCode ? `Zona ${zoneCode.replace("Z-", "")}` : "Belum Ditentukan";

export function SellerRegistration({
  tenants,
  booths,
  onAddTenant,
  onSelectTenant,
}: SellerRegistrationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<SellerCredentials | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TRegisterSellerSchema>({
    resolver: zodResolver(registerSellerSchema),
    defaultValues: {
      tenantName: "",
      category: "Makanan",
      boothNumber: "",
      description: "",
      phone: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const availableBooths = booths
    .filter((booth) => booth.status === "available")
    .map((booth) => booth.boothNumber);

  const boothNumber = useWatch({ control, name: "boothNumber" }) ?? "";
  const selectedBooth = booths.find(
    (booth) => booth.boothNumber === boothNumber,
  );
  const zone = zoneLabelFromCode(selectedBooth?.zoneCode);

  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} disalin.`);
    } catch {
      toast.error(`Gagal menyalin ${label.toLowerCase()}.`);
    }
  };

  const onSubmit = async (data: TRegisterSellerSchema) => {
    setSubmitError(null);

    try {
      const result = await createSellerWithTenantAction({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        tenantName: data.tenantName.trim(),
        category: data.category,
        zone,
        boothNumber: data.boothNumber || undefined,
        description: data.description?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
      });

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      if (!result.tenantId) {
        const message = "Server tidak mengembalikan ID tenant.";
        setSubmitError(message);
        toast.error(message);
        return;
      }

      const initials = data.tenantName
        .trim()
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const newTenant: AssociationTenant = {
        id: result.tenantId,
        name: data.tenantName.trim(),
        owner: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || "Belum diisi",
        category: data.category,
        zone,
        boothNumber: data.boothNumber || "Belum Ditentukan",
        status: "active",
        joinedAt: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        monthlyRevenue: 0,
        rating: 0,
        totalProducts: 0,
        avatar: initials || "TN",
        description: data.description?.trim(),
      };

      onAddTenant(newTenant);
      setCredentials({
        tenantName: newTenant.name,
        email: newTenant.email,
        password: data.password,
      });
      reset();
      toast.success(result.message);
    } catch {
      const message = "Terjadi kendala saat menghubungi server.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Registrasi Pedagang
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Daftarkan akun seller dan tenant sekaligus. Akun langsung aktif dan
          dapat dipakai pedagang untuk masuk.
        </p>
      </div>

      {credentials && (
        <Card className="border-emerald-600/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Akun {credentials.tenantName} berhasil dibuat
            </CardTitle>
            <CardDescription>
              Serahkan kredensial ini ke pedagang. Kata sandi tidak ditampilkan
              lagi setelah panel ini ditutup.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="credential-email">Email seller</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="credential-email"
                    value={credentials.email}
                    readOnly
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label="Salin email seller"
                      title="Salin email seller"
                      onClick={() => handleCopy("Email", credentials.email)}
                    >
                      <Copy />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="credential-password">
                  Kata sandi awal
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="credential-password"
                    value={credentials.password}
                    readOnly
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label="Salin kata sandi awal"
                      title="Salin kata sandi awal"
                      onClick={() =>
                        handleCopy("Kata sandi", credentials.password)
                      }
                    >
                      <Copy />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCredentials(null)}
                className="gap-1.5 text-xs"
              >
                <X className="size-3.5" />
                Tutup panel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            Form registrasi
          </CardTitle>
          <CardDescription>
            Semua field bertanda bintang wajib diisi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-5">
              <div className="flex flex-col gap-3">
                <h2 className="border-b pb-1 text-sm font-semibold text-foreground">
                  Profil usaha dan stan
                </h2>

                <Field>
                  <FieldLabel htmlFor="tenantName">
                    Nama usaha atau tenant{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="tenantName"
                    placeholder="Contoh: Kopi Titik Temu"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.tenantName}
                    {...register("tenantName")}
                  />
                  {errors.tenantName && (
                    <FieldError>{errors.tenantName.message}</FieldError>
                  )}
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="category">
                      Kategori usaha <span className="text-destructive">*</span>
                    </FieldLabel>
                    <select
                      id="category"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.category}
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                      {...register("category")}
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <FieldError>{errors.category.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="boothNumber">
                      Booth tersedia
                    </FieldLabel>
                    <Combobox
                      items={availableBooths}
                      value={boothNumber || null}
                      onValueChange={(value) =>
                        setValue("boothNumber", value ?? "", {
                          shouldValidate: true,
                        })
                      }
                    >
                      <ComboboxInput
                        id="boothNumber"
                        showClear
                        disabled={isSubmitting}
                        placeholder={
                          availableBooths.length > 0
                            ? "Pilih booth tersedia"
                            : "Tidak ada booth tersedia"
                        }
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>Tidak ada booth tersedia.</ComboboxEmpty>
                        <ComboboxList>
                          {(booth) => (
                            <ComboboxItem key={booth} value={booth}>
                              {booth}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FieldDescription>
                      {selectedBooth
                        ? `${zone} • ${selectedBooth.size}`
                        : "Kosongkan jika booth belum ditentukan."}
                    </FieldDescription>
                  </Field>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="phone">Nomor WhatsApp</FieldLabel>
                    <Input
                      id="phone"
                      placeholder="0812-3456-7890"
                      disabled={isSubmitting}
                      {...register("phone")}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">
                      Deskripsi singkat usaha
                    </FieldLabel>
                    <Textarea
                      id="description"
                      rows={2}
                      placeholder="Menu utama atau daya tarik tenant"
                      disabled={isSubmitting}
                      {...register("description")}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b pb-1">
                  <KeyRound className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Akun seller
                  </h2>
                </div>
                <p className="-mt-2 text-xs text-muted-foreground">
                  Akun ini dibuat dengan peran seller dan terhubung ke tenant di
                  atas.
                </p>

                <Field>
                  <FieldLabel htmlFor="ownerName">
                    Nama lengkap pemilik{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="ownerName"
                    placeholder="Contoh: Ahmad Fauzi"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && (
                    <FieldError>{errors.name.message}</FieldError>
                  )}
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="email">
                      Email login seller{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seller@bazaar.id"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                    {errors.email ? (
                      <FieldError>{errors.email.message}</FieldError>
                    ) : (
                      <FieldDescription>
                        Email dipakai pedagang untuk masuk.
                      </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">
                      Kata sandi awal{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        disabled={isSubmitting}
                        aria-invalid={!!errors.password}
                        {...register("password")}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-xs"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={
                            showPassword
                              ? "Sembunyikan kata sandi"
                              : "Tampilkan kata sandi"
                          }
                          title={
                            showPassword
                              ? "Sembunyikan kata sandi"
                              : "Tampilkan kata sandi"
                          }
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {errors.password ? (
                      <FieldError>{errors.password.message}</FieldError>
                    ) : (
                      <FieldDescription>
                        Berikan kata sandi ini ke pedagang.
                      </FieldDescription>
                    )}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Konfirmasi kata sandi{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ulangi kata sandi awal"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                </Field>
              </div>

              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Registrasi gagal</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => {
                    reset();
                    setSubmitError(null);
                  }}
                >
                  Bersihkan form
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="size-3.5" />
                      Mendaftarkan...
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      Daftarkan pedagang
                    </>
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <SellerRegistrationHistory
        tenants={tenants}
        onSelectTenant={onSelectTenant}
      />
    </div>
  );
}
