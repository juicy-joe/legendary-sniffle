import AboutContentForm from "@/components/admin/AboutContentForm";
import { getAboutContent } from "@/lib/content";

export const metadata = { title: "About Page Content — Admin" };

export default async function AdminAboutContentPage() {
  const content = await getAboutContent();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">About Page Content</h1>
      <AboutContentForm content={content} />
    </div>
  );
}
