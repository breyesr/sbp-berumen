import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";
import AppNavigation from "@/components/layout/AppNavigation";
import AppScripts from "@/components/layout/AppScripts";
import TwoFAEnforcementModal from "@/components/layout/TwoFAEnforcementModal";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed]">
      <AppHeader />
      <div className="mx-auto flex w-full flex-1 gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden shrink-0 lg:block transition-all duration-300">
          <AppNavigation />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="lg:hidden">
            <AppNavigation />
          </div>
          <main className="min-w-0 flex-1">{children}</main>
          <AppFooter />
        </div>
      </div>
      <TwoFAEnforcementModal />
      <AppScripts />
    </div>
  );
}
