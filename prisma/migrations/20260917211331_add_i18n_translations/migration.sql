-- CreateTable
CREATE TABLE "UiTranslation" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UiTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UiTranslation_locale_idx" ON "UiTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "UiTranslation_locale_key_key" ON "UiTranslation"("locale", "key");

-- CreateTable
CREATE TABLE "ContentTranslation" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentTranslation_locale_model_idx" ON "ContentTranslation"("locale", "model");

-- CreateIndex
CREATE UNIQUE INDEX "ContentTranslation_locale_model_recordId_field_key" ON "ContentTranslation"("locale", "model", "recordId", "field");
