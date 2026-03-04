-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FloorPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'upload',
    "filePath" TEXT,
    "fileUrl" TEXT,
    "widthMeters" DOUBLE PRECISION,
    "heightMeters" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FloorPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderJob" (
    "id" TEXT NOT NULL,
    "floorPlanId" TEXT NOT NULL,
    "userId" TEXT,
    "stylePreset" TEXT NOT NULL DEFAULT 'modern_minimal',
    "cameraPreset" TEXT NOT NULL DEFAULT 'isometric',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RenderJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderImage" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "imagePath" TEXT,
    "imageUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "viewLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RenderImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCallLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openrouter',
    "model" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "promptSummary" TEXT,
    "responseMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "FloorPlan_userId_idx" ON "FloorPlan"("userId");

-- CreateIndex
CREATE INDEX "RenderJob_floorPlanId_idx" ON "RenderJob"("floorPlanId");

-- CreateIndex
CREATE INDEX "RenderJob_userId_idx" ON "RenderJob"("userId");

-- CreateIndex
CREATE INDEX "RenderImage_jobId_idx" ON "RenderImage"("jobId");

-- CreateIndex
CREATE INDEX "AiCallLog_jobId_idx" ON "AiCallLog"("jobId");

-- AddForeignKey
ALTER TABLE "FloorPlan" ADD CONSTRAINT "FloorPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_floorPlanId_fkey" FOREIGN KEY ("floorPlanId") REFERENCES "FloorPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderImage" ADD CONSTRAINT "RenderImage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "RenderJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCallLog" ADD CONSTRAINT "AiCallLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "RenderJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
