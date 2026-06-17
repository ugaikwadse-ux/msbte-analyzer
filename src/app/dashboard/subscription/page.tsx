"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Building2, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { saveSubscription, getUserSubscription } from "@/lib/db";
import type { Subscription } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Input } from "@/components/ui/elements";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Zap,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    description: "Perfect to get started",
    features: [
      "Single result access",
      "Manual result lookup",
      "Basic subject table",
      "1 department",
      "Up to 20 seats per batch",
    ],
    limits: [
      "Batch analysis > 20 seats",
      "More than 1 department",
      "Watermarked exports",
    ],
    cta: "Current Plan",
  },
  {
    id: "institute" as const,
    name: "Institute",
    price: "₹1599",
    period: "for 1 month",
    icon: Building2,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/40",
    description: "Full access for your entire institute",
    popular: true,
    features: [
      "Unlimited batch analyses",
      "Up to 500 students/batch",
      "No watermark on exports",
      "CSV & PDF export",
      "Topper lists",
      "Subject-wise analysis",
      "Charts & statistics",
      "Unlimited departments",
      "Institute logo on reports",
      "Branded PDF exports",
      "Bulk batch processing",
      "Priority email support",
      "Annual report generation",
    ],
    cta: "Upgrade to Institute Plan",
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, subscriptionPlan } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentIframeUrl, setPaymentIframeUrl] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "institute" | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserSubscription(user.uid)
      .then(setSubscription)
      .finally(() => setLoading(false));
  }, [user]);

  // Listen for messages from the iframe (if Vorynex posts messages back) or rely on polling
  useEffect(() => {
    if (!paymentIframeUrl) return;

    const handleMessage = (event: MessageEvent) => {
      // If Vorynex sends a message or redirects within the iframe
      if (typeof event.data === 'string' && event.data.includes('SUCCESS')) {
         // handle success if possible
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [paymentIframeUrl]);

  const handleUpgradeClick = (planId: "premium" | "institute") => {
    setSelectedPlan(planId);
    setPhoneDialogOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!user || !selectedPlan) return;
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({ title: 'Valid phone number required', variant: 'error' });
      return;
    }

    setProcessingPlan(selectedPlan);
    try {
      const planPrices: Record<string, number> = { institute: 1599 };
      const amount = planPrices[selectedPlan] || 1599;

      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: selectedPlan, 
          amount,
          email: user.email, 
          phone: phoneNumber,
          userId: user.uid 
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to initiate payment');
      }
      const { orderId } = await res.json();
      
      // Load payment URL in iframe to hide it from address bar
      // We use a local proxy route so the frontend never sees the actual vorynex URL
      setPaymentIframeUrl(`/api/payment/checkout?orderId=${orderId}`);
      
      // Start polling the verify API to check when payment succeeds
      const pollInterval = setInterval(async () => {
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.status === 'SUCCESS') {
            clearInterval(pollInterval);
            setPaymentIframeUrl(null);
            setPhoneDialogOpen(false);
            toast({ title: 'Payment Successful', variant: 'success' });
            setTimeout(() => window.location.reload(), 1500);
          } else if (verifyData.status === 'FAILED') {
            clearInterval(pollInterval);
            setPaymentIframeUrl(null);
            toast({ title: 'Payment Failed', variant: 'error' });
          }
        } catch (e) {
          // ignore polling errors
        }
      }, 5000);

    } catch (e: any) {
      console.error(e);
      toast({ title: 'Payment initiation failed', description: e.message, variant: 'error' });
      setProcessingPlan(null);
    }
  };



  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your plan and billing.
        </p>
      </div>

      {/* Current plan banner */}
      {subscription && subscriptionPlan !== "free" && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  You&apos;re on the Institute plan
                </p>
                <p className="text-sm text-muted-foreground">
                  Active subscription · All premium features unlocked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-2 max-w-3xl gap-5">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = subscriptionPlan === plan.id;
          const isUpgrade = plans.findIndex((p) => p.id === plan.id) > plans.findIndex((p) => p.id === subscriptionPlan);

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-3">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-2 ${plan.bg}`}>
                  <Icon className={`h-5 w-5 ${plan.color}`} />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                  {plan.limits?.map((limit) => (
                    <li key={limit} className="flex items-start gap-2 text-sm">
                      <span className="h-4 w-4 flex-shrink-0 mt-0.5 text-center text-muted-foreground">✗</span>
                      <span className="text-muted-foreground">{limit}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline" disabled>
                      ✓ Current Plan
                    </Button>
                    {plan.id !== "free" && subscription && (
                      <p className="text-xs text-center text-muted-foreground font-medium">
                        Expires on: {new Date(subscription.startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : isUpgrade && plan.id !== "free" ? (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    loading={processingPlan === plan.id}
                    onClick={() => handleUpgradeClick(plan.id as "premium" | "institute")}
                  >
                    {plan.cta}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment note */}
      <Card className="bg-muted/30">
        <CardContent className="p-5 flex items-start gap-3">
          <ExternalLink className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Secure Payments</p>
            <p className="text-sm text-muted-foreground mt-1">
              Payments are processed securely via Vorynex and PhonePe.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={phoneDialogOpen && !paymentIframeUrl} onOpenChange={setPhoneDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Phone Number</DialogTitle>
            <DialogDescription>
              A valid phone number is required to process your payment securely.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPhoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment} disabled={phoneNumber.length < 10}>
              Proceed to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full screen Iframe container bypassing all Dialog constraints */}
      {paymentIframeUrl && (
        <div className="fixed inset-0 z-[100] bg-background w-full h-[100dvh] flex flex-col">
          <iframe 
            src={paymentIframeUrl} 
            className="flex-1 w-full h-full border-0"
            title="Secure Payment"
            allow="payment"
          />
        </div>
      )}
    </div>
  );
}
