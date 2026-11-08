import base from './playwright.config';
import { defineConfig } from '@playwright/test';

/** Alle Tests außer den langen Durchläufen durch das ganze Spiel. */
export default defineConfig({ ...base, testIgnore: ['**/komplett.spec.ts'] });
