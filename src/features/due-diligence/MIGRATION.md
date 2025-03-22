# Migration Guide - Due Diligence Report

This document outlines the steps to migrate from the old monolithic implementation to the new modular components.

## Step 1: Test Both Implementations Side by Side

Before making a full switch, test both implementations:

1. Keep the existing files in place
2. Add the new files with "Refactored" suffix (as they currently are)
3. Create a temporary route that uses the new implementation for comparison:

```tsx
// In your router
<Route path="/due-diligence/old/:companyId" element={<DueDiligenceReportWrapper />} />
<Route path="/due-diligence/new/:companyId" element={<DueDiligenceReportWrapperRefactored />} />
```

This allows comparing the old and new implementations to ensure they render identical reports.

## Step 2: Fix Any Issues

Review both implementations and address any differences or issues:

1. Ensure all data is displayed correctly
2. Check responsive behavior across different screen sizes
3. Test edge cases with different report data structures
4. Verify that conditional rendering works as expected

## Step 3: Perform the Migration

Once the new implementation is verified, proceed with the migration:

1. Create a backup of the original files
2. Replace the original files with the refactored versions:

```bash
# Rename refactored files to replace the originals
mv src/features/due-diligence/components/DueDiligenceReportRefactored.tsx src/features/due-diligence/components/DueDiligenceReport.tsx
mv src/features/due-diligence/components/DueDiligenceReportWrapperRefactored.tsx src/features/due-diligence/components/DueDiligenceReportWrapper.tsx
```

3. Update the imports in the main report component to use the new section components
4. Update the route to use the new implementation

## Step 4: Clean Up

After successful migration:

1. Remove any backup or temporary files
2. Update tests to work with the new component structure
3. Update documentation to reflect the new architecture

## Step 5: Gradual Enhancement

With the more maintainable structure in place, consider these enhancements:

1. Add printing functionality
2. Implement report export options (PDF, Excel)
3. Add animations for better UX
4. Implement chart visualizations for financial data

## Rollback Plan

If issues are encountered after migration:

1. Revert to the original files from backup
2. Roll back any imports that were changed
3. Update the routes to use the original implementation

## Verification Checklist

After migration, verify the following:

- [ ] All sections render correctly
- [ ] Responsive design works on all screen sizes
- [ ] Data loading and error states are handled properly
- [ ] Conditional rendering works for all data scenarios
- [ ] Performance is maintained or improved
- [ ] UI styling is consistent
- [ ] No console errors or warnings 