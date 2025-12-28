# Audit Report Monitoring Dashboard

## Architecture overview

### Components
- **Next.js 14 App Router** (`src/app`): dashboard, upload, drill-down screens using TailwindCSS, React Hook Form, Zod.
- **Shared parser/normalizer layer** (`src/lib/parsers`, `src/lib/utils`): canonical data model validation, date parsing, status classification, deterministic report IDs.
- **Firebase**
  - **Auth** with custom claims for roles.
  - **Firestore** for normalized report storage and status history.
  - **Storage** for raw file uploads.
  - **Cloud Functions** (`functions/src/index.ts`) to parse and normalize on upload finalize.

### Firestore schema
- `uploadBatches/{batchId}`: batch metadata + parseSummary + warnings/errors.
- `reports/{reportId}`: canonical report record with computed due dates.
- `reports/{reportId}/statusEvents/{eventId}`: status timeline snapshots per batch.
- `reports/{reportId}/reportEdits/{editId}`: manual UI edits (audit trail).
- `mappings/{mappingId}`: wing/state normalization + Excel column mappings.

### Ingestion flow
1. User uploads DOCX/XLSX with as-on date + dataset type.
2. File stored in **Firebase Storage** under `datasets/` with metadata.
3. **Cloud Function** triggers on finalize, parses file using `mammoth` or `docx4js` fallback + `xlsx`.
4. Each row is normalized, validated with Zod, and written to Firestore under `reports` and `statusEvents`.
5. `uploadBatches` record stores parse summary, warnings, and errors.

## Folder structure
```
audit-dashboard/
  src/
    app/
    lib/
      parsers/
      schemas/
      utils/
  functions/
    src/
  firestore.rules
  firestore.indexes.json
  storage.rules
```

## Firebase setup steps
1. Install dependencies:
   ```bash
   npm install
   (cd functions && npm install)
   ```
2. Create Firebase project and enable **Auth**, **Firestore**, **Storage**, **Functions**.
3. Configure local environment variables (`.env.local`):
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
4. Deploy Firebase resources:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   firebase deploy --only functions
   ```
5. Assign custom claims (`ADMIN`, `EDITOR`, `VIEWER`) via Admin SDK or CLI script.

## Security rules & indexes
- Firestore rules in `firestore.rules` enforce role-based access.
- Storage rules in `storage.rules` permit uploads to `datasets/` for ADMIN/EDITOR.
- Indexes in `firestore.indexes.json` support common filters (wing, status, due date).

## Parser tests
Run parser tests with:
```bash
npm test
```

## Admin guide
### Upload
1. Navigate to **Upload Dataset**.
2. Provide as-on date, dataset type, optional notes.
3. Upload DOCX or XLSX file.

### Troubleshooting parsing
- Review `uploadBatches/{batchId}` warnings/errors.
- Update Excel column mappings under `mappings/` for new templates.
- Use **Reprocess batch** (ADMIN) after mapping updates.

### Export
- Filter dashboard by universe/wing/status/date range.
- Export to Excel/PDF from the report list.
- Use **CAG Submission Summary** to generate wing-wise overdue lists and narrative summaries.
