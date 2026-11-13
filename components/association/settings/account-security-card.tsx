"use client";

import { useState } from "react";
import { KeyRound, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
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
import { toast } from "sonner";

export function AccountSecurityCard({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });

      if (error) {
        toast.error(error.message || "Gagal memperbarui kata sandi.");
        return;
      }

      toast.success("Kata sandi berhasil diperbarui.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Gagal memperbarui kata sandi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKeyhole className="size-4 text-primary" />
          Keamanan Akun
        </CardTitle>
        <CardDescription>
          Ganti kata sandi akun pengelola Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="security-email">Email akun</Label>
            <Input
              id="security-email"
              type="email"
              value={email}
              readOnly
              className="h-11 bg-muted/50 text-muted-foreground sm:h-8"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="security-current">Kata sandi saat ini</Label>
              <Input
                id="security-current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                className="h-11 sm:h-8"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="security-new">Kata sandi baru</Label>
              <Input
                id="security-new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                className="h-11 sm:h-8"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="security-confirm">Ulangi kata sandi baru</Label>
              <Input
                id="security-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                className="h-11 sm:h-8"
              />
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="security-revoke">Keluarkan dari sesi lain</Label>
              <p className="text-xs text-muted-foreground">
                Semua perangkat lain harus login ulang setelah kata sandi
                diganti.
              </p>
            </div>
            <Switch
              id="security-revoke"
              checked={revokeOtherSessions}
              onCheckedChange={setRevokeOtherSessions}
              className="mt-0.5"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 gap-1.5 sm:h-8"
            >
              {isSaving ? (
                <Spinner className="size-4" />
              ) : (
                <KeyRound className="size-4" />
              )}
              {isSaving ? "Menyimpan..." : "Perbarui Kata Sandi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
