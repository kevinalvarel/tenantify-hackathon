"use client";

import { useState } from "react";
import {
  CalendarDays,
  Phone,
  UserPlus,
  Users,
} from "lucide-react";
import type { Employee } from "@/types/seller";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type EmployeesManagementProps = {
  employees: Employee[];
};

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function EmployeesManagement({ employees }: EmployeesManagementProps) {
  const [items, setItems] = useState(employees);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setName("");
    setPhone("");
    setJoinedAt("");
    setIsActive(true);
  };

  const handleCreateEmployee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Nama karyawan tidak boleh kosong.");
      return;
    }
    if (!joinedAt) {
      toast.error("Tanggal bergabung wajib diisi.");
      return;
    }

    const employee: Employee = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      isActive,
      joinedAt,
    };

    setItems((prev) => [employee, ...prev]);
    toast.success(`Karyawan "${employee.name}" berhasil ditambahkan.`);
    setShowAddDialog(false);
    resetForm();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-4" />
          {items.length} karyawan terdaftar
        </p>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="h-11 gap-1.5 sm:h-8"
        >
          <UserPlus className="size-4" />
          Tambah Karyawan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((employee) => (
          <Card key={employee.id}>
            <CardContent className="flex flex-col gap-3 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar>
                    <AvatarFallback className="text-xs font-semibold">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {employee.name}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Phone className="size-3" />
                      {employee.phone || "Kontak belum diisi"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={employee.isActive ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {employee.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  Bergabung {formatDate(employee.joinedAt)}
                </span>
                {employee.isDemo && <span className="text-[10px]">Data demo</span>}
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <Users className="mb-2 size-10 opacity-40" />
            <p className="text-sm font-semibold">Belum ada karyawan.</p>
            <p className="text-xs">
              Karyawan yang Anda tambahkan akan tampil di sini.
            </p>
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateEmployee}>
            <DialogHeader>
              <DialogTitle>Tambah Karyawan</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-4">
              <Field>
                <FieldLabel htmlFor="employee-name">Nama lengkap *</FieldLabel>
                <Input
                  id="employee-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Contoh: Rani Anggraini"
                  maxLength={60}
                  required
                  className="h-11 sm:h-8"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="employee-phone">Nomor HP / WhatsApp</FieldLabel>
                <Input
                  id="employee-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="08xx-xxxx-xxxx"
                  maxLength={20}
                  className="h-11 sm:h-8"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="employee-joined">Tanggal bergabung *</FieldLabel>
                <Input
                  id="employee-joined"
                  type="date"
                  value={joinedAt}
                  onChange={(event) => setJoinedAt(event.target.value)}
                  required
                  className="h-11 sm:h-8"
                />
              </Field>

              <Field>
                <FieldLabel>Status karyawan</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    aria-pressed={isActive}
                    onClick={() => setIsActive(true)}
                    className="h-10 sm:h-7"
                  >
                    Aktif
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!isActive ? "default" : "outline"}
                    aria-pressed={!isActive}
                    onClick={() => setIsActive(false)}
                    className="h-10 sm:h-7"
                  >
                    Nonaktif
                  </Button>
                </div>
              </Field>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="h-11 sm:h-8"
              >
                Batal
              </Button>
              <Button type="submit" className="h-11 gap-1.5 sm:h-8">
                <UserPlus className="size-4" />
                Simpan Karyawan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
