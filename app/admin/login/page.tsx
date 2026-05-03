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
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/70 rounded-[2rem] shadow-xl">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="font-serif text-4xl">HUME Control</CardTitle>
          <CardDescription>Enter your secure API token to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-xs uppercase tracking-widest text-muted-foreground">API Token</Label>
              <Input 
                id="token" 
                type="password" 
                value={token} 
                onChange={e => setToken(e.target.value)} 
                placeholder="Paste your secure token"
                className="rounded-xl bg-secondary/30 h-12"
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-xl h-12" disabled={loading}>
              {loading ? "Authenticating..." : "Secure Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
