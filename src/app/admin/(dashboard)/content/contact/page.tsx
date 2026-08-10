import ContactInfoForm from "@/components/admin/ContactInfoForm";
import { getContactInfo } from "@/lib/content";

export const metadata = { title: "Contact Info — Admin" };

export default async function AdminContactInfoPage() {
  const content = await getContactInfo();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Contact Info</h1>
      <ContactInfoForm content={content} />
    </div>
  );
}
