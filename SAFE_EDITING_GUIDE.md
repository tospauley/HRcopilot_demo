# Safe Editing Guide for Files with Unicode Characters

## Problem
When editing files containing Unicode characters (₦, €, £, ¥, etc.) in PowerShell, files can accidentally become 0 bytes due to encoding issues.

## Root Cause
PowerShell's default encoding may not handle UTF-8 Unicode characters properly, especially when using redirection operators (`>`, `>>`) or certain text editors.

## Solutions

### 1. Use the Safe Unicode Editor Script
```powershell
# Backup a file before editing
.\scripts\safe-unicode-edit.ps1 -File "demoData.ts" -Action backup

# Verify Unicode content
.\scripts\safe-unicode-edit.ps1 -File "demoData.ts" -Action verify

# Edit safely (automatically creates backup)
.\scripts\safe-unicode-edit.ps1 -File "demoData.ts" -Action edit -Content "export const CURRENCY = '₦'"

# Restore from backup if something goes wrong
.\scripts\safe-unicode-edit.ps1 -File "demoData.ts" -Action restore
```

### 2. Git Workflow for Safe Changes
```bash
# Always create a branch for Unicode-related changes
git checkout -b fix/currency-symbols

# Stage changes incrementally
git add index.html index.css

# Commit with descriptive message
git commit -m "fix: add Inter font for Unicode currency symbol support"

# Test thoroughly before pushing
npm run build
npm start

# If tests pass, push to remote
git push origin fix/currency-symbols
```

### 3. Manual Safe Editing Practices
- **Never use**: `echo "content" > file.tsx` (can create 0-byte files)
- **Instead use**: `Set-Content -Path "file.tsx" -Value "content" -Encoding UTF8`
- **Always backup first**: `Copy-Item file.tsx file.tsx.backup`
- **Verify after edit**: Check file size with `(Get-Item file.tsx).Length`

### 4. Recommended Tools for Unicode Editing
1. **VS Code**: Excellent UTF-8 support, shows encoding in status bar
2. **Notepad++**: Good Unicode support, can convert encoding
3. **Sublime Text**: Good UTF-8 handling

### 5. Font Solution Implemented
We've added **Inter font** to support Unicode currency symbols:
- Added Inter to Google Fonts import in `index.html`
- Made Inter the primary font in `index.css`
- Inter has excellent Unicode support including ₦ (Naira), € (Euro), £ (Pound), ¥ (Yen)

## Testing Currency Symbols
Open `currency-test.html` in a browser to verify symbols display correctly:
- ₦ Naira (Nigeria)
- $ Dollar (US)
- € Euro (Europe)
- £ Pound (UK)
- ¥ Yen (Japan)
- ₹ Rupee (India)

## Emergency Recovery
If a file becomes 0 bytes:
```bash
# Check git status
git status

# Restore from git
git checkout -- filename.tsx

# Or restore from backup
.\scripts\safe-unicode-edit.ps1 -File "filename.tsx" -Action restore
```

## Prevention Checklist
- [ ] Always backup before editing Unicode files
- [ ] Use UTF-8 encoding explicitly
- [ ] Verify file size after editing
- [ ] Test in browser after font changes
- [ ] Commit changes to git frequently
## Files That Were Accidentally Deleted and Restored

The following files were accidentally saved as 0 bytes when trying to fix currency symbols and have been restored from git:

### Pages:
- `pages/CRM.tsx` - CRM module (caused the "Cannot convert object to primitive value" error)
- `pages/Settings.tsx` - Settings page
- `pages/MyPayroll.tsx` - Was restored earlier
- `pages/Payroll.tsx` - Was restored earlier  
- `pages/Dashboard.tsx` - Was restored earlier

### Components:
- `components/AIAdvisorModal.tsx` - Was restored earlier
- `components/InsightRibbon.tsx` - Insight ribbon component
- `src/components/Dashboard.tsx` - Dashboard component

### Demo Components:
- `src/demo/components/DemoCompletionModal.tsx` - Demo completion modal
- `src/demo/components/DemoLeakageModal.tsx` - Demo leakage modal
- `src/demo/components/DemoPayslipModal.tsx` - Demo payslip modal
- `src/demo/components/LeakageClosingScreen.tsx` - Leakage closing screen

## Root Cause Analysis
When using PowerShell to edit files containing Unicode characters (₦, €, £, ¥):
1. Text editors or redirection operators (`>`, `>>`) may not handle UTF-8 properly
2. Files can be saved as 0 bytes without warning
3. React's lazy loading fails with "Cannot convert object to primitive value" error

## Prevention Strategy
1. **Always use the safe editor script** for files with Unicode
2. **Commit frequently** to git so files can be restored
3. **Verify file size** after editing: `(Get-Item filename.tsx).Length`
4. **Use VS Code** for editing Unicode files (excellent UTF-8 support)