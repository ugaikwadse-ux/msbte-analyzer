"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input, Label, Alert } from "@/components/ui/elements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/elements";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      setError(msg.includes("user-not-found") ? "No account found with this email." : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Reset password</CardTitle>
        <CardDescription>We&apos;ll send a reset link to your email</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Check your inbox</h3>
            <p className="text-sm text-muted-foreground mb-6">
              We sent a password reset link to <strong>{email}</strong>. 
              Check your spam folder if you don&apos;t see it.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">Back to sign in</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@institute.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Send Reset Link
            </Button>

            <Link href="/auth/login">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
