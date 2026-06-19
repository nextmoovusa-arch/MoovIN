"use client";

import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SearchTrigger } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur px-4 lg:px-6">
      <div className="lg:hidden">
        <Logo markClassName="h-7 w-7" wordClassName="text-base" />
      </div>
      <div className="flex-1 flex items-center justify-end gap-3">
        <SearchTrigger />
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
          >
            3
          </Badge>
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Compte utilisateur">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
