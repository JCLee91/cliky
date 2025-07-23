# Download Formats Update for PRD and Task List
Date: 2025-01-22

## Summary
Updated both PRD and Task List download buttons to use consistent dropdown menu UI with MD and XML format support.

## Changes Made

### 1. PRD Viewer Download Button Enhancement
In `src/components/prd-viewer/index.tsx`:
- Changed from single "Download" button to dropdown menu with options
- Added XML export format alongside Markdown
- Integrated "Copy to Clipboard" into the dropdown menu
- Removed separate Copy button for cleaner UI
- Added timestamp to downloaded filenames (e.g., `PRD_2025-01-22.md`)

### 2. Task List Download Button Update  
In `src/components/task-cards/download-button.tsx`:
- Replaced CSV format with XML format
- XML export includes:
  - Summary statistics (total, completed, in_progress, todo counts)
  - Full task details including details and test_strategy fields
  - Subtask information if present
  - CDATA sections for safe text content

### 3. XML Format Structure

#### PRD XML Format:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<prd>
  <section name="Section Title">
    <content><![CDATA[Section content here]]></content>
  </section>
</prd>
```

#### Task List XML Format:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tasks>
  <summary>
    <total>12</total>
    <completed>3</completed>
    <in_progress>2</in_progress>
    <todo>7</todo>
  </summary>
  <task id="1">
    <title><![CDATA[Task title]]></title>
    <description><![CDATA[Task description]]></description>
    <priority>high</priority>
    <status>todo</status>
    <details><![CDATA[Implementation details]]></details>
    <test_strategy><![CDATA[Testing approach]]></test_strategy>
    <subtasks>
      <subtask id="1.1">
        <title><![CDATA[Subtask title]]></title>
        <description><![CDATA[Subtask description]]></description>
        <status>todo</status>
      </subtask>
    </subtasks>
  </task>
</tasks>
```

## User Experience Improvements
- Consistent dropdown UI across both download buttons
- Support for both human-readable (MD) and machine-readable (XML) formats
- Copy to clipboard integrated into download menu for quick access
- Clear format indicators with appropriate icons (FileText for MD, FileCode for XML)

## Technical Notes
- Used CDATA sections in XML to safely handle special characters
- Added proper XML declarations and UTF-8 encoding
- Maintained all existing task information including new fields (details, test_strategy, subtasks)
- File timestamps prevent overwrites and help with version tracking