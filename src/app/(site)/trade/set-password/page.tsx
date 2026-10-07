import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WholesaleSetPasswordForm from "@/components/WholesaleSetPasswordForm";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Set Your Password",
  robots: { index: false, follow: false },
};

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const locale = await getLocale();
  const dict = await getUiTranslations(locale);

  const account = token
    ? await prisma.wholesaleAccount.findUnique({ where: { inviteToken: token } })
    : null;
  const valid =
    !!account &&
    account.status === "APPROVED" &&
    !!account.inviteTokenExpiresAt &&
    account.inviteTokenExpiresAt > new Date();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-20 md:px-10">
      {valid ? (
        <>
          <p className="mb-2 text-center font-serif text-2xl font-light text-ink">
            {t(dict, "tradePortal.setPasswordHeading", "Set Your Password")}
          </p>
          <p className="mb-10 text-center text-sm text-ink/60">
            {t(
              dict,
              "tradePortal.setPasswordWelcome",
              "Welcome, {businessName}. Choose a password to access your trade pricing."
            ).replace("{businessName}", account.businessName)}
          </p>
          <WholesaleSetPasswordForm token={token!} />
        </>
      ) : (
        <>
          <p className="mb-2 text-center font-serif text-2xl font-light text-ink">
            {t(dict, "tradePortal.linkInvalidHeading", "Link Invalid or Expired")}
          </p>
          <p className="text-center text-sm text-ink/60">
            {t(dict, "tradePortal.linkInvalidBody", "This link is no longer valid. Contact us and we'll send you a new one.")}
          </p>
        </>
      )}
    </div>
  );
}
