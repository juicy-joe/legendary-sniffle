import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EnquiryStatusControl from "@/components/admin/EnquiryStatusControl";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import { deleteEnquiry } from "../actions";

export const metadata = { title: "Enquiry — Admin" };

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiry = await prisma.enquiry.findUnique({ where: { id } });
  if (!enquiry) notFound();

  // Opening an enquiry is itself the "read" action — no extra click needed.
  if (enquiry.status === "NEW") {
    await prisma.enquiry.update({ where: { id }, data: { status: "READ" } });
    enquiry.status = "READ";
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/enquiries" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Enquiries
      </Link>

      <div className="rounded-[6px] border border-ink/10 bg-paper p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-light text-ink">{enquiry.name}</h1>
            <a href={`mailto:${enquiry.email}`} className="text-sm text-gold-dark hover:underline">
              {enquiry.email}
            </a>
          </div>
          <DeleteEntityButton id={enquiry.id} name={enquiry.name} action={deleteEnquiry} />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-ink/10 py-4 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.15em] text-ink/65">Interest</dt>
            <dd className="mt-1 text-ink/80">{enquiry.interest}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.15em] text-ink/65">Received</dt>
            <dd className="mt-1 text-ink/80">
              {enquiry.createdAt.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/65">Message</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{enquiry.message}</p>
        </div>

        <div className="mt-8 border-t border-ink/10 pt-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Status</p>
          <EnquiryStatusControl id={enquiry.id} status={enquiry.status} />
        </div>
      </div>
    </div>
  );
}
