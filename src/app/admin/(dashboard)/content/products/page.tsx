import ProductsContentForm from "@/components/admin/ProductsContentForm";
import { getProductsContent } from "@/lib/content";

export const metadata = { title: "Products Page Content — Admin" };

export default async function AdminProductsContentPage() {
  const content = await getProductsContent("en");

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Products Page Content</h1>
      <ProductsContentForm content={content} />
    </div>
  );
}
