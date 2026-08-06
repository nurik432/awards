-- CreateTable
CREATE TABLE "Nomination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "formType" TEXT NOT NULL DEFAULT 'basic',
    "googleFormUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nominationId" TEXT NOT NULL,
    "employeeData" TEXT NOT NULL,
    "formData" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewNote" TEXT,
    CONSTRAINT "Application_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "Nomination" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Winner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "nominationId" TEXT NOT NULL,
    "subNomination" TEXT,
    "year" INTEGER NOT NULL,
    "photo" TEXT,
    CONSTRAINT "Winner_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "Nomination" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "album" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Nomination_slug_key" ON "Nomination"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
