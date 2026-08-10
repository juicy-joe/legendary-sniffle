import DesignerForm from "@/components/admin/DesignerForm";

export const metadata = { title: "New Designer — Admin" };

export default function NewDesignerPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">New Designer</h1>
      <DesignerForm mode="create" />
    </div>
  );
}
