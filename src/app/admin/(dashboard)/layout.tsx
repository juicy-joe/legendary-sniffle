import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Lamp,
  Layers,
  Tag,
  Users,
  FileText,
  Mail,
  Package,
  Menu,
  Share2,
  ShieldCheck,
  Settings as SettingsIcon,
} from "lucide-react";
import { getSession } from "@/lib/get-session";
import { logout } from "@/app/admin/login/actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | SaFaLight Admin" },
  robots: { index: false, follow: false },
};

// Grows as each admin section is built — kept to only-what-exists so there
// are never dead links in the nav. Staff is Owner-only since it manages who
// can log in at all.
const baseNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Lamp },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/designers", label: "Designers", icon: Users },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/menus", label: "Menus", icon: Menu },
  { href: "/admin/social", label: "Social", icon: Share2 },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];
const ownerNavItems = [{ href: "/admin/staff", label: "Staff", icon: ShieldCheck }];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: middleware already guards /admin/**, but a Server
  // Component that trusts middleware alone is one config change away from
  // an open admin panel. Re-check here too.
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const navItems = session.role === "OWNER" ? [...baseNavItems, ...ownerNavItems] : baseNavItems;

  return (
    <div className="flex min-h-screen bg-paper-dim text-ink">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 bg-ink text-paper md:flex">
        <div className="px-6 py-6">
          <Link href="/admin" className="font-serif text-xl font-medium">
            Sa<span className="text-gold">Fa</span>Light
          </Link>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-paper/45">
            Admin
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[3px] px-3 py-2.5 text-sm text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper"
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-paper/10 px-6 py-5">
          <p className="truncate text-sm text-paper/85">{session.name}</p>
          <p className="truncate text-xs text-paper/50">{session.email}</p>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-paper/60 transition-colors hover:text-gold"
            >
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar — full sidebar collapses to this + a nav strip until a proper drawer is built */}
      <div className="fixed inset-x-0 top-0 z-40 md:hidden">
        <div className="flex items-center justify-between border-b border-ink/10 bg-ink px-4 py-3 text-paper">
          <Link href="/admin" className="font-serif text-lg font-medium">
            Sa<span className="text-gold">Fa</span>Light Admin
          </Link>
          <form action={logout}>
            <button type="submit" aria-label="Log out" className="text-paper/70">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-b border-ink/10 bg-ink px-3 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-xs text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper"
            >
              <item.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <main className="flex-1 px-6 py-8 pt-28 md:px-10 md:py-10 md:pt-10">
        {children}
      </main>
    </div>
  );
}
