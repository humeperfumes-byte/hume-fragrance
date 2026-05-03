"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BlogFormSheet } from "./BlogFormSheet";

export function BlogsTable({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setPosts(posts.filter(p => p.slug !== slug));
      toast({ title: "Blog post deleted" });
      router.refresh();
    } catch (err) {
      toast({ title: "Error deleting post", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Write Article
        </Button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow className="border-border/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Title</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Category</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Author</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Date</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Featured</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No articles found. Write your first one!
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className="border-border/50 hover:bg-secondary/10 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground max-w-[300px] truncate">{post.title}</span>
                        <span className="text-xs text-muted-foreground">/{post.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{post.category}</TableCell>
                    <TableCell className="text-sm">{post.author}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{post.date}</TableCell>
                    <TableCell className="text-center">
                      {post.featured && <Badge className="bg-primary/10 text-primary border-none shadow-none">Featured</Badge>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                            View Live
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer" onClick={() => handleDelete(post.slug)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <BlogFormSheet 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={() => {
          setIsFormOpen(false);
          router.refresh();
        }} 
      />
    </div>
  );
}
