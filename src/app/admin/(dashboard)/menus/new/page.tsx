import MenuItemForm from "@/components/admin/MenuItemForm";

export const metadata = { title: "New Link — Admin" };

export default async function NewMenuItemPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">New Link</h1>
      <MenuItemForm mode="create" defaultLocation={location} />
    </div>
  );
}
