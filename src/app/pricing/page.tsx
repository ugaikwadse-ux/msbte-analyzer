import Link from "next/link";
import { Check, Zap, Crown, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "@/components/ui/elements";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Zap,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    description: "Get started with basic result lookup",
    features: [
      "Single result search (no login needed)",
      "Complete subject-wise marks view",
      "Total marks & percentage",
      "HTML result download",
      "1 department after login",
      "Up to 20 seats per batch analysis",
      "Watermarked exports",
    ],
    not: [
      "Batch result analysis > 20 students",
      "More than 1 department",
      "PDF/CSV exports without watermark",
      "Custom branded PDF exports",
    ],
    cta: "Get Started Free",
    href: "/auth/signup",
  },
  {
    id: "institute",
    name: "Institute",
    price: "₹199",
    originalPrice: "₹2999",
    period: "month",
    icon: Building2,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/40",
    description: "Launch Offer - Complete solution for institutes/universities",
    popular: true,
    features: [
      "Unlimited departments",
      "Unlimited batch analyses",
      "Up to 500 students per batch",
      "No watermark on exports",
      "CSV & PDF export",
      "Topper list generation",
      "Subject-wise failure analysis",
      "Pass/fail statistics with charts",
      "Institute logo on all reports",
      "Custom branded PDF exports",
      "Annual report generation",
      "Priority email support",
      "Bulk seat range processing",
    ],
    not: [],
    cta: "Start Institute Plan",
    href: "/auth/signup",
  },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes, you can upgrade or downgrade anytime from your dashboard subscription page.",
  },
  {
    q: "Is there a free trial for the Institute Plan?",
    a: "The Free plan lets you explore all basic features. Institute features are immediately available after upgrade.",
  },
  {
    q: "How does the batch analysis work?",
    a: "Enter a start and end seat number. The system fetches all results automatically — no manual work.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We use secure payment processing. All major cards and UPI are accepted.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Simple Pricing</Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Start free, scale as you grow
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No hidden fees. Cancel anytime. All plans include the core result analysis platform.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 max-w-4xl mx-auto gap-6 mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${
                    plan.popular
                      ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="px-3">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${plan.bg}`}>
                      <Icon className={`h-5 w-5 ${plan.color}`} />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      <span>{plan.name}</span>
                      {plan.id === "institute" && (
                        <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider animate-pulse">Launch Offer</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      {"originalPrice" in plan && plan.originalPrice && (
                        <span className="text-base text-muted-foreground line-through font-medium">{plan.originalPrice}</span>
                      )}
                      <span className="text-muted-foreground text-sm ml-0.5">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between gap-6">
                    <ul className="space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {plan.not.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm opacity-50">
                          <span className="h-4 w-4 flex-shrink-0 mt-0.5 text-center">✗</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href}>
                      <Button
                        className="w-full gap-2"
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                      >
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.q}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-4">Need a custom plan for a large institute?</p>
            <Button variant="outline" size="lg">Contact Us</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
