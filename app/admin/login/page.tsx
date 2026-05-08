"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "../actions";
import { toast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const result = await loginAdmin(token);
    if (result.success) {
      toast({ title: "Authenticated successfully" });
      router.push("/admin/dashboard");
    } else {
      toast({ title: "Authentication failed", description: result.error, variant: "destructive" });
      setLoading(false);
    }
  }

  return (
    <main className="admin-shell flex min-h-screen items-center justify-center bg-[#f6f6f6] p-4">
      <Card className="w-full max-w-md rounded-lg border-neutral-200 shadow-none">
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="text-2xl font-semibold">HUME Admin</CardTitle>
          <CardDescription>Enter your API token to access operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-sm font-medium text-muted-foreground">API Token</Label>
              <Input 
                id="token" 
                type="password" 
                value={token} 
                onChange={e => setToken(e.target.value)} 
                placeholder="Paste your secure token"
                className="h-11 rounded-md bg-background"
                required
              />
            </div>
            <Button type="submit" className="h-11 w-full rounded-md" disabled={loading}>
              {loading ? "Authenticating..." : "Secure Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
