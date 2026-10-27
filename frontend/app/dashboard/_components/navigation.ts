import {
  LayoutDashboard,
  Tags,
  SprayCan,
  Boxes,
  UsersRound,
  ShoppingCart,
  ChartNoAxesCombined,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  // Only set for routes that exist. Items without an href are shown as disabled ("Soon").
  href?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }],
  },
  {
    title: "Catalog",
    items: [
      { label: "Brands", icon: Tags, href: "/dashboard/brands" },
      { label: "Perfumes", icon: SprayCan, href: "/dashboard/parfums" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inventory", icon: Boxes, href: "/dashboard/stock" },
      { label: "Customers", icon: UsersRound },
      { label: "Orders", icon: ShoppingCart },
    ],
  },
  {
    title: "Analytics",
    items: [{ label: "Reports", icon: ChartNoAxesCombined }],
  },
  {
    title: "Administration",
    items: [
      { label: "User Management", icon: UserCog, href: "/dashboard/users" },
    ],
  },
];

// "/dashboard" is only active on itself; other items stay active on their sub-pages
// (e.g. User Management is active on /dashboard/users/create and /dashboard/users/5/edit).
export function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
