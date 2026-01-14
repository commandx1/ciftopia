import { Navbar } from "@/components/marketing/Navbar";
import Privacy from "@/components/marketing/Privacy";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-10">
        <Privacy />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
