"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { logout } from "@/servers/auth-server";
import { useSession } from "@/lib/auth/auth-client";
import { Badge } from "@/components/ui/badge";
import {
  ChevronsUpDownIcon,
  SparklesIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
} from "lucide-react";

export function NavUser({
  user,
}: {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const { data: session, refetch } = useSession();

  const activeRole =
    user?.role ||
    (session?.user as { role?: string } | undefined)?.role ||
    "customer";

  const activeUser = {
    name: user?.name || session?.user?.name || "Pengguna",
    email: user?.email || session?.user?.email || "",
    avatar: user?.avatar || session?.user?.image || "",
    role: activeRole,
  };

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U"
    );
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      const res = await logout();

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      await refetch();
      router.push("/auth/sign-in");
      router.refresh();
    } catch {
      toast.error("Terjadi kendala saat keluar dari akun.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar>
              <AvatarImage src={activeUser.avatar} alt={activeUser.name} />
              <AvatarFallback>{getInitials(activeUser.name)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium">{activeUser.name}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 uppercase"
                >
                  {activeUser.role}
                </Badge>
              </div>
              <span className="truncate text-xs text-muted-foreground">
                {activeUser.email}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    <AvatarImage
                      src={activeUser.avatar}
                      alt={activeUser.name}
                    />
                    <AvatarFallback>
                      {getInitials(activeUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium">
                        {activeUser.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0 uppercase"
                      >
                        {activeUser.role}
                      </Badge>
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {activeUser.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer"
            >
              {isLoggingOut ? <Spinner className="mr-2" /> : <LogOutIcon />}
              {isLoggingOut ? "Keluar..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
