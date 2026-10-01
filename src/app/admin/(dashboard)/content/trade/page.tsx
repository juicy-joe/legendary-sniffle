import TradeContentForm from "@/components/admin/TradeContentForm";
import { getTradeContent } from "@/lib/content";

export const metadata = { title: "B2B Page Content — Admin" };

export default async function AdminTradeContentPage() {
  const content = await getTradeContent("en");

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">B2B Page Content</h1>
      <TradeContentForm content={content} />
    </div>
  );
}
