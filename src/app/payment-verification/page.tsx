"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/elements";
import { Button } from "@/components/ui/button";

export default function PaymentVerificationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const router = useRouter();
  
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (data.status === "SUCCESS") {
          setStatus("success");
          // Redirect to dashboard after a delay
          setTimeout(() => {
            router.push("/dashboard/subscription");
          }, 3000);
        } else {
          // If failed, optionally retry
          if (retryCount < 5) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 5000);
          } else {
             setStatus("failed");
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        if (retryCount < 5) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 5000);
        } else {
           setStatus("failed");
        }
      }
    };

    if (status === "verifying") {
        verifyPayment();
    }
  }, [orderId, retryCount, router, status]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {status === "verifying" && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <h2 className="text-xl font-bold">Verifying Payment</h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we confirm your payment securely. Do not close this window.
                {retryCount > 0 && ` (Retry ${retryCount}/5)`}
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4 animate-in zoom-in duration-300">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Payment Successful!</h2>
              <p className="text-muted-foreground text-sm">
                Your subscription has been activated securely. Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-4 animate-in zoom-in duration-300">
              <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Verification Failed</h2>
              <p className="text-muted-foreground text-sm mb-4">
                We could not verify your payment. If the amount was deducted, it will be refunded automatically.
              </p>
              <Button onClick={() => router.push("/dashboard/subscription")} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
