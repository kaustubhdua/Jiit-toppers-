-- Personal academic records. All writes must go through authenticated server routes.
-- RLS is enabled with no Data API policies: browser clients must not access these tables directly.

CREATE TYPE "AcademicRecordSource" AS ENUM ('MANUAL', 'CSV_IMPORT', 'XLSX_IMPORT', 'PDF_IMPORT', 'AUTHORIZED_PORTAL');
CREATE TYPE "AcademicImportKind" AS ENUM ('GRADE_CARD', 'ATTENDANCE', 'TIMETABLE', 'EXAM_SCHEDULE');
CREATE TYPE "AcademicImportStatus" AS ENUM ('REVIEW_REQUIRED', 'CONFIRMED', 'FAILED', 'DELETED');

CREATE TABLE "AcademicTerm" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "academicYear" INTEGER NOT NULL,
  "semesterNumber" INTEGER NOT NULL,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicTerm_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AcademicTerm_semesterNumber_check" CHECK ("semesterNumber" BETWEEN 1 AND 12),
  CONSTRAINT "AcademicTerm_academicYear_check" CHECK ("academicYear" BETWEEN 2000 AND 2100),
  CONSTRAINT "AcademicTerm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudentSubject" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "termId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "credits" DECIMAL(4,1) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentSubject_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentSubject_credits_check" CHECK ("credits" > 0 AND "credits" <= 30),
  CONSTRAINT "StudentSubject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudentSubject_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AcademicImport" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "termId" TEXT,
  "kind" "AcademicImportKind" NOT NULL,
  "status" "AcademicImportStatus" NOT NULL DEFAULT 'REVIEW_REQUIRED',
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" BIGINT NOT NULL,
  "checksum" TEXT,
  "storageKey" TEXT,
  "parserVersion" TEXT,
  "sourceLabel" TEXT,
  "errorSummary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "AcademicImport_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AcademicImport_sizeBytes_check" CHECK ("sizeBytes" > 0 AND "sizeBytes" <= 26214400),
  CONSTRAINT "AcademicImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AcademicImport_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "GradeRecord" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "termId" TEXT NOT NULL,
  "studentSubjectId" TEXT NOT NULL,
  "gradePoint" DECIMAL(4,2) NOT NULL,
  "letterGrade" TEXT,
  "marksObtained" DECIMAL(6,2),
  "maxMarks" DECIMAL(6,2),
  "source" "AcademicRecordSource" NOT NULL DEFAULT 'MANUAL',
  "sourceLabel" TEXT,
  "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "importId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GradeRecord_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GradeRecord_gradePoint_check" CHECK ("gradePoint" BETWEEN 0 AND 10),
  CONSTRAINT "GradeRecord_marks_check" CHECK (("marksObtained" IS NULL OR "marksObtained" >= 0) AND ("maxMarks" IS NULL OR "maxMarks" > 0) AND ("marksObtained" IS NULL OR "maxMarks" IS NULL OR "marksObtained" <= "maxMarks")),
  CONSTRAINT "GradeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GradeRecord_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GradeRecord_studentSubjectId_fkey" FOREIGN KEY ("studentSubjectId") REFERENCES "StudentSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GradeRecord_importId_fkey" FOREIGN KEY ("importId") REFERENCES "AcademicImport"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "AttendanceSnapshot" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "termId" TEXT NOT NULL,
  "studentSubjectId" TEXT NOT NULL,
  "classesHeld" INTEGER NOT NULL,
  "classesAttended" INTEGER NOT NULL,
  "targetPercent" DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  "source" "AcademicRecordSource" NOT NULL DEFAULT 'MANUAL',
  "sourceLabel" TEXT,
  "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "importId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttendanceSnapshot_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AttendanceSnapshot_counts_check" CHECK ("classesHeld" >= 0 AND "classesAttended" >= 0 AND "classesAttended" <= "classesHeld"),
  CONSTRAINT "AttendanceSnapshot_targetPercent_check" CHECK ("targetPercent" BETWEEN 0 AND 100),
  CONSTRAINT "AttendanceSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AttendanceSnapshot_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AttendanceSnapshot_studentSubjectId_fkey" FOREIGN KEY ("studentSubjectId") REFERENCES "StudentSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AttendanceSnapshot_importId_fkey" FOREIGN KEY ("importId") REFERENCES "AcademicImport"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AcademicTerm_userId_academicYear_semesterNumber_key" ON "AcademicTerm"("userId", "academicYear", "semesterNumber");
CREATE INDEX "AcademicTerm_userId_academicYear_idx" ON "AcademicTerm"("userId", "academicYear");
CREATE UNIQUE INDEX "StudentSubject_termId_code_key" ON "StudentSubject"("termId", "code");
CREATE INDEX "StudentSubject_userId_termId_idx" ON "StudentSubject"("userId", "termId");
CREATE UNIQUE INDEX "AcademicImport_userId_termId_kind_checksum_key" ON "AcademicImport"("userId", "termId", "kind", "checksum");
CREATE INDEX "AcademicImport_userId_createdAt_idx" ON "AcademicImport"("userId", "createdAt");
CREATE INDEX "AcademicImport_userId_status_idx" ON "AcademicImport"("userId", "status");
CREATE UNIQUE INDEX "GradeRecord_userId_termId_studentSubjectId_key" ON "GradeRecord"("userId", "termId", "studentSubjectId");
CREATE INDEX "GradeRecord_userId_termId_observedAt_idx" ON "GradeRecord"("userId", "termId", "observedAt");
CREATE INDEX "GradeRecord_importId_idx" ON "GradeRecord"("importId");
CREATE INDEX "AttendanceSnapshot_userId_termId_observedAt_idx" ON "AttendanceSnapshot"("userId", "termId", "observedAt");
CREATE INDEX "AttendanceSnapshot_studentSubjectId_observedAt_idx" ON "AttendanceSnapshot"("studentSubjectId", "observedAt");
CREATE INDEX "AttendanceSnapshot_importId_idx" ON "AttendanceSnapshot"("importId");

ALTER TABLE "AcademicTerm" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentSubject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademicImport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GradeRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttendanceSnapshot" ENABLE ROW LEVEL SECURITY;
