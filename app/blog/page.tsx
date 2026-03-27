import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo";
import { getAllBlogPosts } from "@/lib/db/blog";
import BlogClient from "./BlogClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — Fragrance Guides, Tips & Comparisons",
  description:
    "Expert guides on inspired perfumes. Compare Dior Sauvage alternatives, Tom Ford dupes, Creed Aventus clones & more. Tips to find your perfect fragrance.",
};

const blogCategories = [
  "All",
  "Fragrance Guides",
  "Comparisons",
  "Tips & Guides",
];

export default async function BlogPage() {
  const blogPosts = await getAllBlogPosts();

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "HUME Perfumes Blog",
    description:
      "Expert guides, comparisons, and tips on inspired perfumes. Discover the best alternatives to Dior, Chanel, Tom Ford, Creed, YSL and more.",
    url: "https://humefragrance.com/blog",
    publisher: {
      "@type": "Organization",
      name: "HUME Perfumes",
    },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `https://humefragrance.com/blog/${post.slug}`,
      datePublished: post.date,
      author: { "@type": "Person", name: post.author },
      description: post.excerpt,
    })),
  };

  const jsonLd = [
    blogListSchema,
    getBreadcrumbSchema([
      { name: "Home", url: "https://humefragrance.com" },
      { name: "Blog", url: "https://humefragrance.com/blog" },
    ]),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />
      <BlogClient
        blogPosts={blogPosts}
        blogCategories={blogCategories}
      />
      <Footer />
    </main>
  );
}
