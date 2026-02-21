import AppLayout from "@/components/layout/AppLayout";
import AuthGate from "@/components/layout/AuthGate";

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <AppLayout>{children}</AppLayout>
    </AuthGate>
  );
}
