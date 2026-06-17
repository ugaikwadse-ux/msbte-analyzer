"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  CreditCard,
  User,
  LogOut,
  Zap,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/elements";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/departments", icon: Building2, label: "Departments" },
  { href: "/dashboard/analyses", icon: BarChart3, label: "Analyses" },
  { href: "/dashboard/subscription", icon: CreditCard, label: "Subscription" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOutUser, subscriptionPlan } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const planLabel = {
    free: "Free",
    premium: "Premium",
    institute: "Institute",
  }[subscriptionPlan];

  const planVariant = {
    free: "secondary" as const,
    premium: "default" as const,
    institute: "success" as const,
  }[subscriptionPlan];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-border px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg flex-shrink-0">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <Zap className="h-4 w-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-foreground truncate">
              {user?.displayName || user?.email?.split("@")[0] || "User"}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant={planVariant} className="text-[10px] px-1.5 py-0">
                {planLabel}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
        )}
        <button
          onClick={signOutUser}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
