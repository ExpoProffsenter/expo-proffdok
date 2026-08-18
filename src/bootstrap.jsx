// FASE 29A5.2: Minimal bootstrap som aktiverer bildeoptimalisering før Supabase-klienten opprettes.
import { installGlobalStorageImageOptimizer } from './modules/images/imageUploadOptimizer.js';

installGlobalStorageImageOptimizer({
  maxDimension: 2560,
  quality: 0.85
});

import('./main.jsx');
