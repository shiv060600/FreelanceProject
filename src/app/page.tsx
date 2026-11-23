import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PricingCard from "@/components/pricing-card";
import { Hero, SignUpCta } from "@/components/landing/hero";
import { Faq, FinalCta, HowItWorks, MoreFeatures, Showcase } from "@/components/landing/sections";
import { getProviderAvailability } from "@/lib/auth/providers";
import { createClient } from "../../supabase/server";

export const metadata = {
  title: "FreelanceFlow: invoices, clients, contracts and analytics for freelancers",
  description:
    "Send invoices, track clients, draft contracts with AI and see where your revenue comes from. Sign in with Google or Apple. Free to start.",
};

async function loadPlans() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.functions.invoke("supabase-functions-get-plans");
    return Array.isArray(data) ? data.filter((p: any) => p?.name !== "Shilajit Tea") : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const supabase = await createClient();
  const [{ data: { user } }, providers, plans] = await Promise.all([
    supabase.auth.getUser(),
    getProviderAvailability(),
    loadPlans(),
  ]);
  const signedIn = !!user;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero providers={providers} signedIn={signedIn} />
        <Showcase />
        <MoreFeatures />
        <HowItWorks />

        <section id="pricing" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Start free, upgrade when you grow</h2>
              <p className="mt-4 text-lg text-muted-foreground">Paid plans raise your invoice and AI drafting limits. Cancel any time.</p>
            </div>
            {plans.length > 0 ? (
              <div className="grid justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((item: any) => (
                  <PricingCard key={item.id} item={item} user={user} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Paid plans will be listed here shortly. You can create a free account now and upgrade later.</p>
            )}
          </div>
        </section>

        <Faq />
        <FinalCta>
          <SignUpCta providers={providers} signedIn={signedIn} />
        </FinalCta>
      </main>
      <Footer />
    </div>
  );
}
