"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "@/servers/auth-server";
import { useSession } from "@/lib/auth/auth-client";

export function DashboardSignOut() {
  const router = useRouter();
  const { refetch } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const res = await signOut();
      if (res.success) {
        toast.success(res.message);
        await refetch();
        router.push("/auth/sign-in");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Gagal keluar dari sesi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={loading}
      className="gap-2"
    >
      {loading ? <Spinner /> : <LogOutIcon className="size-4" />}
      Keluar
    </Button>
  );
}
