import HomeContentForm from "@/components/admin/HomeContentForm";
import { getHomeContent } from "@/lib/content";

export const metadata = { title: "Homepage Content — Admin" };

export default async function AdminHomeContentPage() {
  const content = await getHomeContent();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Homepage Content</h1>
      <HomeContentForm content={content} />
    </div>
  );
}
