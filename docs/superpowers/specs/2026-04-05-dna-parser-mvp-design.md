# Design: DNA Parser MVP — CERBALAB Report

**Date:** 2026-04-05
**Status:** Approved
**Scope:** Upload CERBALAB PDF DNA reports, parse 223 markers + metadata, display in user dashboard

---

## Context

Genesis sells genetic tests from CERBALAB (Russian lab partner). CERBALAB delivers results as **PDF reports**, not raw TSV files like 23andMe. The report contains:
1. Patient info (ФИО, ДР, пол)
2. Sample info (номер образца, даты)
3. Table of 223 genetic markers (gene, rs, genotype)
4. Detailed interpretations grouped by body system

For MVP, we parse structured data (metadata + 223 markers) and keep full PDF text for search. Interpretation sections are complex nested tables — we don't parse their structure in MVP, users access them via the original PDF download.

## Parser Architecture

### PDF Text Extraction
- **Library:** `pdf-parse` (npm package) — Node.js PDF text extraction
- **Fallback:** If layout is lost, parse by line breaks and patterns
- **Alternative:** shell out to `pdftotext -layout` (requires poppler-utils in Docker)

**Decision:** Use `pdf-parse` first. If quality is insufficient, add poppler-utils to Docker and switch to `pdftotext`.

### Parsing Stages

**Stage 1 — Header extraction (regex):**
- Фамилия, Имя, Отчество → patient_name
- Дата рождения → birth_date (DD.MM.YYYY)
- Пол → sex ("женский"/"мужской")
- Образец № → sample_number
- Дата поступления образца → sample_date
- Дата выдачи результата → result_date

**Stage 2 — Marker table extraction:**
Each marker row matches pattern: `^\s*(\d+)\s+([A-Za-zА-Яа-я0-9]+)\s+(rs\d+|del|ep)\s+([A-Z\/]+(?:\/[A-Z]+)?|wt\/wt|wt\/del|wt\/insC|\d+[TA]\/\d+[TA]|\d+[\-]?\d+\/\d+)$`

Captures:
- position (1-223)
- gene (e.g., ABCB1, MTHFR, ApoE)
- rsid (e.g., rs1045642)
- genotype (e.g., A/A, G/G, wt/wt, 6TA/7TA)

Note: 2-column layout means lines can contain two markers. Pre-split by column.

**Stage 3 — Full text storage:**
Store full extracted text in `dna_reports.full_text` (PostgreSQL TEXT) for client-side search of interpretations.

### Error Handling
- If patient name not found → reject upload with "Не удалось распознать формат CERBALAB"
- If <100 markers parsed → reject (bad PDF or wrong format)
- If >250 markers parsed → reject (format mismatch)

## Database Schema (Drizzle)

```typescript
export const dnaReports = pgTable("dna_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  lab: text("lab").notNull().default("cerbalab"),
  patientName: text("patient_name").notNull(),
  birthDate: text("birth_date"),        // stored as DD.MM.YYYY
  sex: text("sex"),
  sampleNumber: text("sample_number"),
  sampleDate: text("sample_date"),
  resultDate: text("result_date"),
  filePath: text("file_path").notNull(), // relative path under /app/data/dna/
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  fullText: text("full_text"),          // for search
  markersCount: integer("markers_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_dna_reports_user_id").on(table.userId),
]);

export const dnaMarkers = pgTable("dna_markers", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => dnaReports.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  gene: text("gene").notNull(),
  rsid: text("rsid").notNull(),
  genotype: text("genotype").notNull(),
}, (table) => [
  index("idx_dna_markers_report_id").on(table.reportId),
  index("idx_dna_markers_gene").on(table.gene),
  index("idx_dna_markers_rsid").on(table.rsid),
]);
```

## File Storage

- Path: `/app/data/dna/{userId}/{reportId}-{timestamp}.pdf`
- Same Docker volume as test results
- Access only via API route with auth check

## API Routes

### `POST /api/dna/upload`
- Accepts multipart/form-data with PDF file
- Auth: requireUser
- Validates: MIME type (application/pdf), size (<20MB)
- Saves file to `/app/data/dna/{userId}/{filename}`
- Parses PDF → extracts metadata + markers
- Inserts `dna_reports` + 223 `dna_markers` rows
- Returns report id + markers count
- If parsing fails: deletes uploaded file, returns error

### `GET /api/dna/reports`
- Auth: requireUser
- Returns user's reports list (metadata only, no markers)

### `GET /api/dna/reports/[id]`
- Auth: requireUser + check ownership (or admin)
- Returns report + all 223 markers

### `DELETE /api/dna/reports/[id]`
- Auth: requireUser + ownership
- Deletes file from disk + rows from DB (cascade)

### `GET /api/dna/reports/[id]/file`
- Auth: requireUser + ownership (or admin)
- Streams PDF file

## UI Pages

### `/dashboard/dna` — List & Upload
- H1: "Мои ДНК-отчёты"
- Upload button opens file picker
- After upload: progress indicator, then success/error toast
- List of uploaded reports (cards):
  - Patient name
  - Sample number + result date
  - Marker count badge
  - "Посмотреть" button
  - "Скачать PDF" button
  - "Удалить" (with confirmation)

Empty state: "У вас пока нет загруженных отчётов. Загрузите PDF от CERBALAB."

### `/dashboard/dna/[id]` — Report Detail
- Breadcrumb: "← Все отчёты"
- Patient info card: ФИО, ДР, пол, № образца, дата результата
- "Скачать оригинал PDF" button (top right)
- Search bar: "Поиск по гену или rs..."
- Tab 1: Маркеры (default)
  - Sortable table: Позиция, Ген, rs, Генотип
  - Client-side search filter
- Tab 2: Полный текст отчёта
  - Pre-formatted text of interpretations
  - Client-side search with highlight

### Admin view
- New menu item "ДНК-отчёты" in `/admin/dna`
- List all uploaded reports with user email
- Link to same report detail page

## Navigation Update

- Add "ДНК" to user dashboard nav in `src/config/site.ts`:
  ```ts
  { title: "ДНК", href: "/dashboard/dna" },
  ```
  Place between "Результаты" and "Профиль".

- Add to admin nav:
  ```ts
  { title: "ДНК-отчёты", href: "/admin/dna" },
  ```

## Security

- File uploads: MIME type + size validation
- Ownership check on every read/delete
- Admin can read all reports
- Regular users can only see their own
- Files served via API with auth check (not direct static serving)

## Out of Scope (MVP)

- Structured parsing of interpretation sections
- Automatic categorization into body systems
- 23andMe / AncestryDNA / MyHeritage formats
- Matching markers to Genesis's own interpretations
- AI-generated personalized recommendations
- Sharing reports with doctors
- Export to other formats

## Files to Create/Modify

**Create:**
- `src/lib/dna/cerbalab-parser.ts` — PDF text extraction + regex parsing
- `src/lib/dna/types.ts` — TypeScript types for parser output
- `src/app/api/dna/upload/route.ts`
- `src/app/api/dna/reports/route.ts` (GET list)
- `src/app/api/dna/reports/[id]/route.ts` (GET detail, DELETE)
- `src/app/api/dna/reports/[id]/file/route.ts` (serve PDF)
- `src/app/dashboard/dna/page.tsx` — list + upload
- `src/app/dashboard/dna/[id]/page.tsx` — report detail
- `src/components/dna/upload-form.tsx` — client upload component
- `src/components/dna/report-card.tsx` — list item
- `src/components/dna/markers-table.tsx` — table with search
- `src/app/admin/dna/page.tsx` — admin list
- `drizzle/0002_dna_tables.sql` — migration

**Modify:**
- `src/db/schema.ts` — add dnaReports, dnaMarkers tables
- `src/config/site.ts` — add nav items
- `package.json` — add `pdf-parse` dependency
