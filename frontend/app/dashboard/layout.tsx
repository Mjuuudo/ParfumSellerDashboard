import DashboardShell from "./_components/DashboardShell";

// Shared layout for every /dashboard/* page: sidebar navigation + main content area.
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell>{children}</DashboardShell>;
}
