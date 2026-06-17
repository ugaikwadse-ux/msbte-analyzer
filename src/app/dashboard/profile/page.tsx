"use client";

import { useState } from "react";
import { User, Mail, Shield, Camera } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Alert } from "@/components/ui/elements";
import { toast } from "@/components/ui/toaster";

export default function ProfilePage() {
  const { user, subscriptionPlan } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth.currentUser) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await updateDoc(doc(db, "users", user.uid), { displayName: name });
      setSuccess(true);
      toast({ title: "Profile updated", variant: "success" });
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      toast({ title: "Failed to update profile", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const planBadge = {
    free: { label: "Free Plan", variant: "secondary" as const },
    premium: { label: "Premium", variant: "default" as const },
    institute: { label: "Institute", variant: "success" as const },
  }[subscriptionPlan];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information.
        </p>
      </div>

      {/* Avatar */}
      <Card>
        <CardContent className="p-6 flex items-center gap-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl gradient-bg flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {(user?.displayName || user?.email || "U")[0].toUpperCase()}
              </span>
            </div>
            <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{user?.displayName || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant={planBadge.variant} className="mt-2">{planBadge.label}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your name and profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          {success && <Alert variant="success" className="mb-4">Profile updated successfully.</Alert>}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={user?.email || ""}
                  className="pl-9"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-xs text-muted-foreground">Last updated: unknown</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              import("firebase/auth").then(({ sendPasswordResetEmail }) =>
                sendPasswordResetEmail(auth, user?.email || "")
              );
              toast({ title: "Password reset email sent", variant: "success" });
            }}>
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Account created</p>
              <p className="text-xs text-muted-foreground">
                {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
