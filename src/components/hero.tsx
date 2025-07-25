import Link from "next/link";
import { ArrowUpRight, Check, Clock, Users, FileText } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Freelance{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Smarter
              </span>{" "}
              Not Harder
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform for freelancers to manage clients, track
              time, and generate invoices with minimal friction.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-sm">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Client Management</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-sm">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Invoice Generation</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Get Started
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Professional invoices</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Client management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
