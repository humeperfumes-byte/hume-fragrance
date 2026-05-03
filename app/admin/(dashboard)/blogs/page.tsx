import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { BlogsTable } from "./BlogsTable";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const allPosts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif">Editorial Content</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your blog posts, SEO guides, and editorial content.
        </p>
      </div>

      <BlogsTable initialPosts={allPosts} />
    </div>
  );
}
