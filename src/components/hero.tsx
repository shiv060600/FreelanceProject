import Link from "next/link";
import { ArrowUpRight, Check, Clock, Users, FileText, FileSignature} from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-indigo-50/30 dark:via-indigo-500/10 to-purple-50 dark:to-purple-500/10 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      <div className="relative pt-28 pb-36 sm:pt-36 sm:pb-44">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
              Freelance{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                Smarter
              </span>{" "}
              Not Harder
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-14 max-w-3xl mx-auto leading-relaxed font-light">
              The all-in-one platform for freelancers to manage clients, track
              time, and generate invoices with minimal friction.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-14">
              <div className="flex items-center gap-3 bg-card/90 backdrop-blur-sm px-6 py-3.5 rounded-full shadow-md hover:shadow-lg border border-primary/20 transition-all duration-200 hover:scale-105">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground/80">Client Management</span>
              </div>
              <div className="flex items-center gap-3 bg-card/90 backdrop-blur-sm px-6 py-3.5 rounded-full shadow-md hover:shadow-lg border border-purple-100/50 dark:border-purple-500/30 transition-all duration-200 hover:scale-105">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-500/15 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-semibold text-foreground/80">Invoice Generation</span>
              </div>
              <div className="flex items-center gap-3 bg-card/90 backdrop-blur-sm px-6 py-3.5 rounded-full shadow-md hover:shadow-lg border border-pink-100/50 dark:border-pink-500/30 transition-all duration-200 hover:scale-105">
                <div className="p-1.5 bg-pink-100 dark:bg-pink-500/15 rounded-lg">
                  <FileSignature className="w-5 h-5 text-pink-600 dark:text-pink-400"/>
                </div>
                <span className="font-semibold text-foreground/80">Contract Generation</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-10 py-4 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center px-10 py-4 text-foreground/80 bg-card border-2 border-border rounded-xl hover:border-border hover:bg-muted/50 transition-all duration-200 text-lg font-semibold shadow-md hover:shadow-lg"
              >
                View Pricing
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground bg-card/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-border/50 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-emerald-100 dark:bg-emerald-500/15 rounded-full">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-medium">Professional invoices</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-emerald-100 dark:bg-emerald-500/15 rounded-full">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-medium">Client management</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-emerald-100 dark:bg-emerald-500/15 rounded-full">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
