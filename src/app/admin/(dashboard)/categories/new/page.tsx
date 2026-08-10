import CategoryForm from "@/components/admin/CategoryForm";

export const metadata = { title: "New Category — Admin" };

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">New Category</h1>
      <CategoryForm mode="create" />
    </div>
  );
}
