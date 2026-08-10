import { prisma } from "@/lib/prisma";
import SocialLinksForm from "@/components/admin/SocialLinksForm";

export const metadata = { title: "Social Links — Admin" };

export default async function AdminSocialPage() {
  const links = await prisma.socialLink.findMany();
  const byPlatform = Object.fromEntries(links.map((l) => [l.platform, l.url]));

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Social Links</h1>
      <SocialLinksForm
        links={{
          instagram: byPlatform.instagram ?? "",
          facebook: byPlatform.facebook ?? "",
          linkedin: byPlatform.linkedin ?? "",
        }}
      />
    </div>
  );
}
