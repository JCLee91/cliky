# Export to Download Terminology Update
Date: 2025-01-22

## Summary
Standardized all UI terminology from "Export" to "Download" throughout the codebase for consistency.

## Changes Made

### 1. Renamed Component File
- `src/components/task-cards/export-button.tsx` → `src/components/task-cards/download-button.tsx`

### 2. Updated Component Implementation
In `download-button.tsx`:
- Renamed component from `ExportButton` to `DownloadButton`
- Renamed interface from `ExportButtonProps` to `DownloadButtonProps`
- Updated state variable from `isExporting` to `isDownloading`
- Renamed functions:
  - `exportAsMarkdown` → `downloadAsMarkdown`
  - `exportAsJSON` → `downloadAsJSON`
  - `exportAsCSV` → `downloadAsCSV`
- Updated button text from "Export" to "Download"
- Updated success messages from "Exported to..." to "Downloaded as..."

### 3. Updated Component Import
In `src/components/task-cards/index.tsx`:
- Updated import from `ExportButton` to `DownloadButton`
- Updated component usage from `<ExportButton>` to `<DownloadButton>`

### 4. Updated PRD Generation Prompt
In `src/lib/prompts/prd-generation.ts`:
- Changed "Export" to "Download" in feature flow description
- Updated file reference from `export-button.tsx` to `download-button.tsx`
- Changed checklist item from "Export functionality" to "Download functionality"

## Impact
- No functional changes, only terminology updates
- Consistent use of "Download" throughout the UI
- Better aligns with user expectations (downloading files vs exporting data)
- Build tested successfully with no errors

## Future Considerations
- All new features should use "Download" terminology for file-saving operations
- Consider updating any documentation or user guides to reflect this change