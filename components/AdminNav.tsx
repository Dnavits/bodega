"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUpIcon,
  PackageIcon,
  PaletteIcon,
  SettingsIcon,
} from "@/components/Icons";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: TrendingUpIcon,
    exact: true,
  },
  {
    href: "/admin/productos",
    label: "Inventario",
    icon: PackageIcon,
    exact: false,
  },
  {
    href: "/admin/personalizacion",
    label: "Personalización",
    icon: PaletteIcon,
    exact: false,
  },
  {
    href: "/admin/configuracion",
    label: "Configuración",
    icon: SettingsIcon,
    exact: false,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="p-3.5 space-y-1 flex-1">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
              isActive
                ? "bg-ink text-white font-bold shadow-subtle"
                : "text-ink-muted hover:text-ink hover:bg-surface font-semibold"
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? "text-white" : "text-ink-muted group-hover:text-ink"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
