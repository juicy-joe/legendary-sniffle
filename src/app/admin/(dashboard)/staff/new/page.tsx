import { ShieldAlert } from "lucide-react";
import { getSession } from "@/lib/get-session";
import StaffForm from "@/components/admin/StaffForm";

export const metadata = { title: "New Staff Account — Admin" };

export default async function NewStaffPage() {
  const session = await getSession();

  if (session?.role !== "OWNER") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[6px] border border-dashed border-ink/20 px-6 py-16 text-center">
        <ShieldAlert className="h-8 w-8 text-ink/30" strokeWidth={1.5} />
        <h1 className="font-serif text-2xl font-light text-ink">Owners Only</h1>
        <p className="max-w-sm text-sm text-ink/65">
          Staff accounts can only be managed by an Owner.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">New Staff Account</h1>
      <StaffForm mode="create" />
    </div>
  );
}
