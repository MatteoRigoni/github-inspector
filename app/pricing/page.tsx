"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "../components/AppLayout";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  credits: number;
  price: number;
  features: string[];
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    credits: 5,
    price: 0,
    features: [
      "5 credits per month",
      "Basic API access",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 10,
    features: [
      "100 credits per month",
      "Priority API access",
      "Email support",
      "Advanced analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 1000,
    price: 50,
    features: [
      "1000 credits per month",
      "Premium API access",
      "24/7 priority support",
      "Advanced analytics",
      "Custom integrations",
    ],
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchUserPlan();
    }
  }, [status, router]);

  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/users/me");
      if (!response.ok) return;
      const data = await response.json();
      setCurrentPlan(data.plan || "free");
    } catch (err) {
      console.error("Error fetching user plan:", err);
    }
  };

  if (status === "loading") {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="w-8 h-8 border-4 border-zinc-300 dark:border-zinc-600 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Select the perfect plan for your needs. All plans include access to our GitHub Inspector API.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-zinc-900 rounded-xl border-2 p-8 transition-all ${
                    isCurrent
                      ? "border-blue-500 shadow-lg scale-105"
                      : "border-black/[.08] dark:border-white/[.145] hover:shadow-lg"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-black dark:text-zinc-50 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-black dark:text-zinc-50">
                        ${plan.price}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400">/month</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-lg font-semibold text-black dark:text-zinc-50">
                        {plan.credits} Credits
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={isCurrent}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                      isCurrent
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                        : plan.id === "pro"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    }`}
                    onClick={() => {
                      // Coming soon - payment integration
                      alert("Payment integration coming soon!");
                    }}
                  >
                    {isCurrent ? "Current Plan" : plan.price === 0 ? "Get Started" : "Upgrade"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Back to Dashboard */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

