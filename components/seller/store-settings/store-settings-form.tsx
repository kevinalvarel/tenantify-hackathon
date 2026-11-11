"use client";

import { useState } from "react";
import { Clock, MapPin, Power, Save, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function StoreSettingsForm() {
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [booth, setBooth] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("Pengaturan toko disimpan (simulasi).");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="size-4 text-primary" />
              Informasi Toko
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-name">Nama toko</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value)}
                required
                maxLength={60}
                className="h-11 sm:h-8"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-category">Kategori usaha</Label>
              <Input
                id="store-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                maxLength={60}
                className="h-11 sm:h-8"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="store-description">Deskripsi singkat</Label>
                <span className="text-[11px] text-muted-foreground">
                  {description.length}/160
                </span>
              </div>
              <Textarea
                id="store-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={160}
                rows={4}
                className="min-h-24 text-base sm:text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Lokasi & Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="store-booth">Nomor stan / zona</Label>
                <Input
                  id="store-booth"
                  value={booth}
                  onChange={(event) => setBooth(event.target.value)}
                  maxLength={60}
                  className="h-11 sm:h-8"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="store-address">Alamat</Label>
                <Input
                  id="store-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  maxLength={100}
                  className="h-11 sm:h-8"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="store-whatsapp">WhatsApp</Label>
                <Input
                  id="store-whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  maxLength={20}
                  className="h-11 sm:h-8"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Jam Operasional
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="store-open">Jam buka</Label>
                  <Input
                    id="store-open"
                    type="time"
                    value={openTime}
                    onChange={(event) => setOpenTime(event.target.value)}
                    className="h-11 sm:h-8"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="store-close">Jam tutup</Label>
                  <Input
                    id="store-close"
                    type="time"
                    value={closeTime}
                    onChange={(event) => setCloseTime(event.target.value)}
                    className="h-11 sm:h-8"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Status toko</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isOpen ? "default" : "outline"}
                    aria-pressed={isOpen}
                    onClick={() => setIsOpen(true)}
                    className="h-10 gap-1 sm:h-7"
                  >
                    <Power className="size-3.5" />
                    Buka
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!isOpen ? "default" : "outline"}
                    aria-pressed={!isOpen}
                    onClick={() => setIsOpen(false)}
                    className="h-10 gap-1 sm:h-7"
                  >
                    Tutup
                  </Button>
                  <Badge variant={isOpen ? "default" : "destructive"}>
                    {isOpen ? "Toko Buka" : "Toko Tutup"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          Pastikan informasi stan dan jam operasional toko Anda selalu diperbarui.
        </p>
        <Button type="submit" className="h-11 gap-1.5 sm:h-8">
          <Save className="size-4" />
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}
