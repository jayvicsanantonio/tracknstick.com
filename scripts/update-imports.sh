#!/bin/bash

# Update imports in all TypeScript files
echo "Updating imports..."

# UI components
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/components/ui/|@shared/components/ui/|g'

# Hooks
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/hooks/|@shared/hooks/|g'

# Utils/lib
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/lib/|@shared/utils/|g'

# Services
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/services/|@shared/services/|g'

# Types
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/types/|@shared/types/|g'

# Constants
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/constants/|@shared/constants/|g'

# Context/Providers
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/context/|@app/providers/|g'

# Routes
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from '\''@/routes'\''|from '\''@app/routes'\''|g'

# Layouts
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/layouts/|@shared/components/layouts/|g'

# Components
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/components/ErrorBoundary|@shared/components/feedback/ErrorBoundary|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/components/LoadingFallback|@shared/components/feedback/LoadingFallback|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/components/PWAInstallPrompt|@shared/components/feedback/PWAInstallPrompt|g'

# App
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|from '\''@/App|from '\''@app/App|g'

# Utils
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/utils/|@shared/utils/|g'

# Test
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/test/|@testing/|g'

# Styles
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/index\.css|@/styles/index.css|g'

echo "Import updates complete!"
