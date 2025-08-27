# Code Templates

This directory contains templates for creating consistent code across the
project.

## Available Templates

### Component Template (`Component.template.tsx`)

Use this when creating new React components. It includes:

- TypeScript interfaces for props
- JSDoc documentation
- Proper display name
- Export patterns for both named and default exports
- CSS class merging with `cn` utility

**Usage:**

```bash
# Copy and rename
cp src/templates/Component.template.tsx src/components/MyComponent.tsx

# Then update:
# 1. Replace ComponentName with MyComponent
# 2. Update props interface
# 3. Implement component logic
```

### Hook Template (`useHook.template.ts`)

Use this when creating new React hooks. It includes:

- TypeScript interfaces for params and returns
- Standard hook patterns (useState, useEffect, useCallback, useMemo)
- JSDoc documentation
- Proper error handling structure

**Usage:**

```bash
# Copy and rename
cp src/templates/useHook.template.ts src/hooks/useMyHook.ts

# Then update:
# 1. Replace useHookName with useMyHook
# 2. Update parameter and return types
# 3. Implement hook logic
```

### Test Template (`test.template.tsx`)

Use this when creating new test files. It includes:

- Vitest test structure
- React Testing Library imports
- Component and hook test patterns
- Edge case and integration test sections

**Usage:**

```bash
# Copy and rename
cp src/templates/test.template.tsx src/components/__tests__/MyComponent.test.tsx

# Then update:
# 1. Import the component/hook to test
# 2. Implement test cases
# 3. Remove unused sections
```

## Best Practices

1. **Always use templates** for new files to maintain consistency
2. **Keep templates updated** when patterns change
3. **Document thoroughly** using JSDoc comments
4. **Test everything** using the test template structure
5. **Follow naming conventions**:
   - Components: PascalCase (e.g., `MyComponent.tsx`)
   - Hooks: camelCase starting with 'use' (e.g., `useMyHook.ts`)
   - Tests: Same name with `.test` suffix (e.g., `MyComponent.test.tsx`)

## Template Maintenance

When updating templates:

1. Ensure changes align with project standards
2. Update this README if new templates are added
3. Consider backward compatibility
4. Test that templates work correctly

## Future Templates

Planned templates to add:

- [ ] Service/API client template
- [ ] Context provider template
- [ ] Page component template
- [ ] Utility function template
- [ ] GitHub Action workflow template

## Contributing

To add a new template:

1. Create the template file with `.template` in the name
2. Include comprehensive comments and documentation
3. Add usage instructions to this README
4. Ensure it follows project conventions
