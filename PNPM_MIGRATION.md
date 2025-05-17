# Migration to pnpm

## Why We Migrated from npm to pnpm

We've migrated from npm to [pnpm](https://pnpm.io/) as our package manager for the Track N' Stick project. This document explains the motivation behind this change and the benefits it brings to our development workflow.

## Benefits of pnpm

### 1. Disk Space Efficiency

pnpm uses a content-addressable store to avoid duplication of dependencies across projects. Unlike npm or Yarn, which create a copy of each dependency for each project, pnpm creates hard links from a single global store. This approach can save gigabytes of disk space if you work on multiple JavaScript projects.

### 2. Faster Installation

Due to its unique approach to dependency management, pnpm is significantly faster than npm and Yarn in many scenarios. Installation times are reduced because packages are not copied but linked from the store.

### 3. Strict Module Resolution

pnpm creates a non-flat `node_modules` structure that closely matches the actual dependency graph of your project. This prevents the "phantom dependencies" problem where your code can accidentally import packages that are not declared in your `package.json`.

### 4. Better Monorepo Support

pnpm has built-in support for monorepos through its workspace feature, which makes it easier to manage multiple packages in a single repository without relying on additional tools like Lerna.

### 5. Consistent Installations

pnpm ensures that the dependency tree is identical on all machines, which reduces "works on my machine" problems.

## Project Configuration

The following files were added or updated during the migration:

- `.npmrc`: Contains pnpm configuration settings
- `pnpm-lock.yaml`: The lock file that replaces `package-lock.json`
- `package.json`: Updated scripts to use pnpm

### .npmrc Configuration

```
engine-strict=true
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=true
```

- `engine-strict=true`: Ensures the Node.js version meets the requirements
- `auto-install-peers=true`: Automatically installs peer dependencies
- `strict-peer-dependencies=false`: Allows more flexibility with peer dependencies
- `shamefully-hoist=true`: Improves compatibility with packages that expect a flat node_modules structure

## How to Use pnpm

### Installation

If you don't have pnpm installed globally, you can install it with:

```bash
npm install -g pnpm
```

### Basic Commands

- Install dependencies: `pnpm install`
- Add a dependency: `pnpm add <package-name>`
- Add a dev dependency: `pnpm add -D <package-name>`
- Run a script: `pnpm <script-name>`
- Remove a dependency: `pnpm remove <package-name>`

### Migrating from npm

If you're already familiar with npm, the transition to pnpm is straightforward as most commands are similar:

| npm                   | pnpm                |
| --------------------- | ------------------- |
| `npm install`         | `pnpm install`      |
| `npm install <pkg>`   | `pnpm add <pkg>`    |
| `npm run <cmd>`       | `pnpm <cmd>`        |
| `npm test`            | `pnpm test`         |
| `npm uninstall <pkg>` | `pnpm remove <pkg>` |

## Troubleshooting

If you encounter any issues with pnpm, here are some common solutions:

1. Clear pnpm's store cache: `pnpm store prune`
2. Recreate node_modules from scratch: `rm -rf node_modules && pnpm install`
3. Check for pnpm-specific warnings in your build logs

## Resources

- [Official pnpm documentation](https://pnpm.io/motivation)
- [pnpm vs npm vs Yarn comparison](https://pnpm.io/feature-comparison)
