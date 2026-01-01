import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  BarChart4,
  Zap,
  Shield,
  FileSignature
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  const filteredplans = plans?.filter((item:any) => {return item.name !== 'Shilajit Tea'})


  // Debug: Log the plans data to see what we're getting
  if (plans) {
    console.log('Plans data:', plans);
  }
  if (error) {
    console.log('Plans error:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />
      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-5 text-gray-900">
              Freelancer Tools That Work For You
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our platform streamlines your business operations so you can focus
              on what you do best.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                title: "Client Management",
                description:
                  "Organize client information, contact details, projects, and rates in one clean interface.",
                color: "blue",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Invoice Generator",
                description:
                  "Create professional PDF invoices from your time logs with customizable templates.",
                color: "purple",
              },
              {
                icon: <FileSignature className="w-6 h-6" />,
                title: "Contract Management",
                description: "Create contracts manually or using AI to protect you and your business.",
                color: "pink",
              }
            ].map((feature, index) => {
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600 border-blue-200",
                purple: "bg-purple-100 text-purple-600 border-purple-200",
                pink: "bg-pink-100 text-pink-600 border-pink-200",
              };
              return (
                <div
                  key={index}
                  className="group p-8 bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center mb-6 border-2 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-5 text-gray-900">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our platform simplifies your freelance business management in just
              a few steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                number: 1,
                title: "Add Your Clients",
                description: "Enter client details, project information, and hourly rates in our clean interface.",
              },
              {
                number: 2,
                title: "Generate Invoices",
                description: "Create professional invoices with just a few clicks.",
              },
              {
                number: 3,
                title: "Generate Contracts",
                description: "Protect yourself with AI-powered contract generation.",
              },
              {
                number: 4,
                title: "All-in-One Business Hub",
                description: "Manage clients, contracts, invoices, and finances from one unified dashboard designed for freelancers.",
              }
            ].map((step, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 group relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-12 text-center max-w-4xl mx-auto">
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-5xl sm:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">30%</div>
              <div className="text-lg text-blue-100 font-medium">Time Saved on Admin Tasks</div>
            </div>
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-5xl sm:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">15+</div>
              <div className="text-lg text-blue-100 font-medium">Hours Saved Monthly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50/50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-5 text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose the perfect plan for your freelance business needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredplans?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              Ready to Streamline Your Freelance Business?
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join freelancers who are saving time and getting paid
              faster.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center px-10 py-4 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started
              <ArrowUpRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
