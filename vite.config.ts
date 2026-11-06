import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import { Compiler } from 'inkjs/full';

/** Übersetzt .ink-Dateien beim Build nach JSON, damit Dialogfehler sofort auffallen. */
function inkPlugin(): Plugin {
  return {
    name: 'hv-ink',
    load(id) {
      const file = id.split('?')[0];
      if (!file.endsWith('.ink')) return null;
      this.addWatchFile(file);
      try {
        const json = new Compiler(readFileSync(file, 'utf8')).Compile().ToJson() as string;
        return { code: `export default ${JSON.stringify(json)};`, map: null };
      } catch (error) {
        this.error(`Ink-Fehler in ${file}: ${String(error)}`);
      }
    },
  };
}

export default defineConfig({
  base: './',
  publicDir: 'assets',
  plugins: [inkPlugin()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
  build: { chunkSizeWarningLimit: 3000 },
});
