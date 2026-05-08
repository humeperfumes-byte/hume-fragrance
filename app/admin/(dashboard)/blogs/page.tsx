import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { BlogsTable } from "./BlogsTable";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  let allPosts: (typeof blogPosts.$inferSelect)[] = [];
  let dbError = false;

  try {
    allPosts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  } catch (error) {
    console.error("Blogs page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl">Editorial Content</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-medium text-amber-300">Database Sync Required</h3>
            <p className="text-sm text-white/50">
              The blog_posts table could not be queried. Run <code className="bg-white/10 px-2 py-1 rounded text-xs">npm run db:push</code> in your terminal to sync the schema, then refresh this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl">Editorial Content</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your blog posts, SEO guides, and editorial content.
        </p>
      </div>

      <BlogsTable initialPosts={allPosts} />
    </div>
  );
}
