import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
