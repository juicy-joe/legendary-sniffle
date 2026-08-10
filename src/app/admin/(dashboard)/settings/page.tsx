import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
