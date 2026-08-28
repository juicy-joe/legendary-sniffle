import HomeContentForm from "@/components/admin/HomeContentForm";
import HeroImageManager from "@/components/admin/HeroImageManager";
import { getHomeContent, getHeroImages } from "@/lib/content";
import { blobConfigured } from "@/lib/blob";

export const metadata = { title: "Homepage Content — Admin" };

export default async function AdminHomeContentPage() {
  const [content, heroImages] = await Promise.all([getHomeContent(), getHeroImages()]);

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Homepage Content</h1>

      <div className="mb-10">
        <h2 className="mb-1 font-serif text-xl font-light text-ink">Hero Images</h2>
        <p className="mb-4 text-sm text-ink/65">
          Rotates through the homepage hero. Upload a few, mark the order you want with the arrows.
        </p>
        <HeroImageManager images={heroImages} blobConfigured={blobConfigured()} />
      </div>

      <HomeContentForm content={content} />
    </div>
  );
}
