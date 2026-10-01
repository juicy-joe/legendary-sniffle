import ConsultingContentForm from "@/components/admin/ConsultingContentForm";
import { getConsultingContent } from "@/lib/content";

export const metadata = { title: "Consulting Page Content — Admin" };

export default async function AdminConsultingContentPage() {
  const content = await getConsultingContent("en");

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Consulting Page Content</h1>
      <ConsultingContentForm content={content} />
    </div>
  );
}
