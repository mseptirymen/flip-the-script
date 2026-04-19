# Sprite Normalization Pipeline

## Overview
A Node.js script to batch-process all sprites in `/public/icons/`, outputting normalized 64x64 PNGs with consistent sizing and centering.

## Problem
Existing sprites have inconsistent canvas sizes and content positioning (centered, bottom-aligned, etc.), causing visual misalignment when displayed at fixed sizes.

## Solution
Build-time normalization using `sharp` library.

## Implementation

### Process
1. Read each PNG from `/public/icons/*.png`
2. Detect non-transparent pixel bounds
3. Crop to content
4. Resize to fit within 56x56 (4px padding on each side)
5. Center on 64x64 canvas with transparent background
6. Save over original file

### Tool
`sharp` — fast, handles PNG transparency correctly

### Command
```bash
node scripts/normalize-sprites.js
```

### Pre-requisite
```bash
pnpm add -D sharp
```

### Files
- `scripts/normalize-sprites.js` — Node.js script for batch processing

## Safety
- Processes all `*.png` files in `/public/icons/` in-place
- Original files are overwritten
- Run on existing sprites only

## Verification
After running, spot-check a few sprites (e.g., dragapult, blaziken) to confirm consistent sizing.