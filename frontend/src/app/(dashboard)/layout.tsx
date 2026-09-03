import { OrganizationProvider } from "@/components/OrganizationProvider";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <OrganizationProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header />

            <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </OrganizationProvider>
  );
}