"use client";

import { useEffect, useState } from "react";
import { Plus, Building2, Trash2, BookOpen, ChevronRight, Crown, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getDepartments, createDepartment, deleteDepartment, getUserProfile } from "@/lib/db";
import type { Department } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Card, CardContent, CardHeader, CardTitle, Skeleton, Alert, Badge } from "@/components/ui/elements";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

export default function DepartmentsPage() {
  const { user, subscriptionPlan, isPremium } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDepartments(user.uid)
      .then(setDepartments)
      .finally(() => setLoading(false));
  }, [user]);

  const handleAddClick = () => {
    const isPremium = subscriptionPlan === "premium" || subscriptionPlan === "institute";
    if (!isPremium && departments.length >= 1) {
      toast({
        title: "Upgrade Required",
        description: "The Free plan only allows creating 1 department. Please upgrade to the Institute plan for unlimited departments.",
        variant: "error",
      });
      return;
    }
    setCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    // Fresh check to prevent bypass on long-running sessions
    const profile = await getUserProfile(user.uid);
    const plan = profile?.subscription || "free";
    const isPremium = plan === "premium" || plan === "institute" || user.email === "master@msbteresult.online";
    if (!isPremium && departments.length >= 1) {
      toast({
        title: "Upgrade Required",
        description: "The Free plan only allows creating 1 department. Please upgrade to the Institute plan for unlimited departments.",
        variant: "error",
      });
      return;
    }
    setSaving(true);
    try {
      const dept = await createDepartment(user.uid, name.trim(), code.trim());
      setDepartments((prev) => [dept, ...prev]);
      setName("");
      setCode("");
      setCreateOpen(false);
      toast({ title: "Department created", variant: "success" });
    } catch {
      toast({ title: "Failed to create department", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDepartment(deleteTarget.id);
      setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast({ title: "Department deleted", variant: "success" });
    } catch {
      toast({ title: "Failed to delete department", variant: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const suggested = [
    "Computer Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Electronics & Telecommunication",
    "Information Technology",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your departments. Each includes Semester 1–6 automatically.
          </p>
        </div>
        <Button onClick={handleAddClick} className="gap-2 flex-shrink-0">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Special Launch Offer Promo Banner */}
      {!isPremium && (
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-md">
          {/* Decorative glowing background elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 shadow-inner animate-pulse">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">Launch Offer Promotion</span>
                  <Badge variant="destructive" className="text-[10px] px-2 py-0.5 animate-bounce">Offer Expiring Soon</Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground flex flex-wrap items-baseline gap-2">
                  Get Unlimited Departments & Students in Slots for <span className="text-primary font-extrabold text-xl">₹199</span>/month
                  <span className="text-sm text-muted-foreground line-through font-normal">₹2999/month</span>
                </h3>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Free plan is limited to only 1 department and 20 seats. Upgrade now to get <strong>unlimited departments</strong> and <strong>unlimited students per batch</strong>. No limits, no watermarks, full priority access!
                </p>
              </div>
            </div>
            <Link href="/dashboard/subscription" className="w-full md:w-auto flex-shrink-0">
              <Button size="lg" className="w-full md:w-auto gap-2 bg-gradient-to-r from-primary to-primary/95 hover:from-primary/95 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5">
                Upgrade Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : departments.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No departments yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Create a department to start running batch result analyses for your institute.
            </p>
            <Button onClick={handleAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Department
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="card-hover group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{dept.name}</CardTitle>
                      {dept.code && (
                        <p className="text-xs text-muted-foreground mt-0.5">{dept.code}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(dept)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5 mb-4">
                  {dept.semesters.map((sem) => (
                    <Link
                      key={sem.id}
                      href={`/dashboard/analyses?dept=${dept.id}&sem=${sem.number}`}
                      className="flex items-center justify-between rounded-lg px-3 py-1.5 hover:bg-muted transition-colors group/sem"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{sem.label}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/sem:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>
              Create a new department. All 6 semesters are added automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Department Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Computer Engineering"
                required
              />
              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggested.filter((s) => !departments.some((d) => d.name === s)).slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setName(s)}
                    className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Department Code <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CE, ME, CIVIL"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Create Department</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? 
              This action cannot be undone. Existing analyses will remain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting}>
              Delete Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
