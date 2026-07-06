#!/bin/bash
sed -i '' 's/bidCount?: number;/bidCount?: number;\n  buyerNickname?: string;/g' /Users/solfany/Project/nplohs-market/apps/web/src/types/index.ts
