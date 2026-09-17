"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { locales, type Locale } from "@/lib/i18n";
import { allUiKeys } from "@/lib/i18n-keys";

const localeSchema = z.enum(locales);

export type TranslationsFormState = { error?: string; success?: boolean };

// Every translated page in one place — cheaper than trying to track exactly
// which page(s) a given key affects, and this action only runs from the
// admin panel, not on the request path.
function revalidateStorefront() {
  revalidatePath("/", "layout");
}

// Saves every UI-string field on the "Interface Text" tab for one locale in
// a single request. An emptied field deletes its row (reverting to the
// English fallback baked into the page) rather than storing an empty
// string, which would otherwise render as blank text on the live site.
export async function saveUiTranslations(
  _prevState: TranslationsFormState,
  formData: FormData
): Promise<TranslationsFormState> {
  const locale = localeSchema.safeParse(formData.get("locale"));
  if (!locale.success) return { error: "Invalid locale." };

  const knownKeys = new Set(allUiKeys.map((k) => k.key));
  const toUpsert: { key: string; value: string }[] = [];
  const toDelete: string[] = [];

  for (const [name, raw] of formData.entries()) {
    if (!name.startsWith("key:")) continue;
    const key = name.slice("key:".length);
    if (!knownKeys.has(key)) continue;
    const value = String(raw).trim();
    if (value) toUpsert.push({ key, value });
    else toDelete.push(key);
  }

  await prisma.$transaction([
    ...toUpsert.map((row) =>
      prisma.uiTranslation.upsert({
        where: { locale_key: { locale: locale.data, key: row.key } },
        create: { locale: locale.data, key: row.key, value: row.value },
        update: { value: row.value },
      })
    ),
    ...(toDelete.length
      ? [
          prisma.uiTranslation.deleteMany({
            where: { locale: locale.data, key: { in: toDelete } },
          }),
        ]
      : []),
  ]);

  revalidateStorefront();
  return { success: true };
}

const contentModelSchema = z.enum([
  "Product",
  "Designer",
  "Collection",
  "HomeContent",
  "AboutContent",
  "ContactInfo",
  "MenuItem",
]);

// Bulk variant of saveContentTranslation for a whole "Page Content" section
// (e.g. every product's description/story/materials) in one request — field
// names encode "field:<model>|<recordId>|<field>" so the action doesn't need
// a separate round trip per textarea. Same empty-value-deletes-the-row
// semantics as saveUiTranslations.
export async function saveContentTranslationsBulk(
  _prevState: TranslationsFormState,
  formData: FormData
): Promise<TranslationsFormState> {
  const locale = localeSchema.safeParse(formData.get("locale"));
  if (!locale.success) return { error: "Invalid locale." };

  const toUpsert: { model: string; recordId: string; field: string; value: string }[] = [];
  const toDelete: { model: string; recordId: string; field: string }[] = [];

  for (const [name, raw] of formData.entries()) {
    if (!name.startsWith("field:")) continue;
    const [model, recordId, field] = name.slice("field:".length).split("|");
    if (!model || !recordId || !field || !contentModelSchema.safeParse(model).success) continue;
    const value = String(raw).trim();
    if (value) toUpsert.push({ model, recordId, field, value });
    else toDelete.push({ model, recordId, field });
  }

  await prisma.$transaction([
    ...toUpsert.map((row) =>
      prisma.contentTranslation.upsert({
        where: {
          locale_model_recordId_field: {
            locale: locale.data,
            model: row.model,
            recordId: row.recordId,
            field: row.field,
          },
        },
        create: { locale: locale.data, ...row },
        update: { value: row.value },
      })
    ),
    ...toDelete.map((row) =>
      prisma.contentTranslation.deleteMany({
        where: { locale: locale.data, model: row.model, recordId: row.recordId, field: row.field },
      })
    ),
  ]);

  revalidateStorefront();
  return { success: true };
}

export type { Locale };
