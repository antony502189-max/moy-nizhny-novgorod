import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only: serve the Vercel function `api/tour.ts` at /api/tour so the AI proxy works in `npm run dev`.
function devApi(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      for (const [k, v] of Object.entries(env)) if (!(k in process.env)) process.env[k] = v;
      server.middlewares.use('/api/tour', async (req, res) => {
        let body = '';
        for await (const chunk of req) body += chunk;
        try { (req as any).body = body ? JSON.parse(body) : {}; } catch { (req as any).body = {}; }
        const mod = await server.ssrLoadModule('/api/tour.ts');
        const shim = {
          status(code: number) { res.statusCode = code; return shim; },
          setHeader(k: string, v: string) { res.setHeader(k, v); return shim; },
          json(obj: unknown) { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(obj)); },
          end(s?: string) { res.end(s); },
        };
        try { await mod.default(req, shim); } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: String(e) })); }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    plugins: [react(), devApi(env)],
    build: { chunkSizeWarningLimit: 900 },
  };
});
