-- CreateTable
CREATE TABLE "CheckoutHold" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "items" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutHold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutHold_stripeSessionId_key" ON "CheckoutHold"("stripeSessionId");
