"use client";

import { useState } from "react";
import { Bell, Building2, ImagePlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateAssociationSettingsAction } from "@/servers/association-server";

type SettingsValues = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  notifyNewTenant: boolean;
  notifyNewReview: boolean;
  notifyPaymentDue: boolean;
};

const NOTIFICATIONS: {
  key: "notifyNewTenant" | "notifyNewReview" | "notifyPaymentDue";
  label: string;
  description: string;
}[] = [
  {
    key: "notifyNewTenant",
    label: "Pedagang baru",
    description: "Beri tahu saat ada pendaftaran tenant baru di area Anda.",
  },
  {
    key: "notifyNewReview",
    label: "Ulasan pelanggan",
    description: "Beri tahu saat pelanggan mengirim ulasan baru.",
  },
  {
    key: "notifyPaymentDue",
    label: "Jatuh tempo sewa",
    description: "Beri tahu saat sewa booth mendekati tanggal jatuh tempo.",
  },
];

export function AssociationSettingsForm({
  initial,
}: {
  initial: SettingsValues;
}) {
  const [values, setValues] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);

  const initials =
    values.name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "AB";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const response = await updateAssociationSettingsAction(values);
    setIsSaving(false);

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Profil Area
          </CardTitle>
          <CardDescription>
            Informasi ini tampil untuk pembeli saat mencari area Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* TODO: unggah logo butuh penyimpanan blob; tombol dinonaktifkan sampai fitur siap. */}
          <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-base font-semibold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Logo area</p>
              <p className="text-xs text-muted-foreground">
                Placeholder. Unggah logo belum tersedia.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="h-9 shrink-0 gap-1.5 sm:h-8"
            >
              <ImagePlus className="size-3.5" />
              Unggah logo
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settings-name">Nama area</Label>
              <Input
                id="settings-name"
                value={values.name}
                onChange={(event) =>
                  setValues({ ...values, name: event.target.value })
                }
                required
                minLength={3}
                maxLength={80}
                className="h-11 sm:h-8"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settings-phone">Telepon / WhatsApp</Label>
              <Input
                id="settings-phone"
                type="tel"
                value={values.phone}
                onChange={(event) =>
                  setValues({ ...values, phone: event.target.value })
                }
                maxLength={20}
                className="h-11 sm:h-8"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="settings-email">Email pengelola</Label>
              <Input
                id="settings-email"
                type="email"
                value={values.email}
                onChange={(event) =>
                  setValues({ ...values, email: event.target.value })
                }
                maxLength={120}
                className="h-11 sm:h-8"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="settings-address">Alamat area</Label>
              <Input
                id="settings-address"
                value={values.address}
                onChange={(event) =>
                  setValues({ ...values, address: event.target.value })
                }
                maxLength={160}
                className="h-11 sm:h-8"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="settings-description">Deskripsi singkat</Label>
                <span className="text-[11px] text-muted-foreground">
                  {values.description.length}/240
                </span>
              </div>
              <Textarea
                id="settings-description"
                value={values.description}
                onChange={(event) =>
                  setValues({ ...values, description: event.target.value })
                }
                maxLength={240}
                rows={3}
                className="min-h-20 text-base sm:text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            Notifikasi
          </CardTitle>
          <CardDescription>
            Pilih peristiwa yang ingin Anda ketahui.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {NOTIFICATIONS.map((item, index) => (
            <div
              key={item.key}
              className={
                index === NOTIFICATIONS.length - 1
                  ? "flex items-start justify-between gap-4 py-3"
                  : "flex items-start justify-between gap-4 border-b py-3"
              }
            >
              <div className="flex flex-col gap-1">
                <Label htmlFor={`settings-${item.key}`}>{item.label}</Label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Switch
                id={`settings-${item.key}`}
                checked={values[item.key]}
                onCheckedChange={(checked) =>
                  setValues({ ...values, [item.key]: checked })
                }
                className="mt-0.5"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          Perubahan berlaku setelah Anda menekan Simpan.
        </p>
        <Button
          type="submit"
          disabled={isSaving}
          className="h-11 gap-1.5 sm:h-8"
        >
          {isSaving ? (
            <Spinner className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>
    </form>
  );
}
