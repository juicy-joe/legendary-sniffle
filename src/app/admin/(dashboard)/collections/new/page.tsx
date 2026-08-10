import CollectionForm from "@/components/admin/CollectionForm";

export const metadata = { title: "New Collection — Admin" };

export default function NewCollectionPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">New Collection</h1>
      <CollectionForm mode="create" />
    </div>
  );
}
