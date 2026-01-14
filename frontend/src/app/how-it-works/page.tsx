import { Navbar } from "@/components/marketing/Navbar";
import HowItWorksPage from "@/components/marketing/HowItWorksPage";
import { Footer } from "@/components/marketing/Footer";

export default function HowItWorks() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-10">
        <HowItWorksPage />
      </main>
      <Footer />
    </div>
  );
}
