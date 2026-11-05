import type { Metadata } from "next";
import CategoryManager from "./CategoryManager";
export const metadata: Metadata = { title: "Categories | HUME Admin" };
export default function CategoriesPage() {
  return <CategoryManager />;
}
