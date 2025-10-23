# Logotip Kiosk

A Next.js-based kiosk application for a local print shop, built with the [T3 Stack](https://create.t3.gg/) and optimized for performance.

## Features

- 🎨 Product catalog with categories and subcategories
- 🖼️ Responsive image gallery with lazy loading
- 📱 PWA support for offline functionality
- ⚡ Optimized for performance with React memoization
- 🔄 Swipe gesture navigation
- ⏱️ Automatic idle redirect for kiosk mode
- 🎯 Landscape-first design


Key optimizations include:

- React component memoization (React.memo, useMemo, useCallback)
- Reduced font loading (75% reduction in font files)
- Smart image lazy loading with priority hints
- Data layer caching with Map-based lookups
- Server/client component splitting
- CSS containment for better rendering
- Optimized event listeners with passive flags

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
pnpm start
```

### Code Quality

```bash
# Run linter
pnpm lint

# Run type checker
pnpm typecheck

# Run both
pnpm check
```
