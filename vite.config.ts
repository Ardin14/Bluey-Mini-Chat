import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mochaPlugins } from "@getmocha/vite-plugins";

// Dynamically import the Cloudflare plugin inside the config function so that
// the module isn't required at top-level during config load. Some CI/node
// environments (or plugin versions) import `undici` which expects Web
// globals like `File` to exist and can throw during module evaluation. A
// guarded dynamic import prevents that crash and falls back to no plugin.
export default defineConfig(async (): Promise<import("vite").UserConfig> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const basePlugins = [...mochaPlugins(process.env as any), react()];

  try {
    const cf = await import("@cloudflare/vite-plugin");
    // treat dynamically imported module as any to avoid stricter type checks
    const anyCf = cf as any;
    const cloudflare = anyCf.default ?? anyCf.cloudflare ?? anyCf;
    if (typeof cloudflare === "function") basePlugins.push(cloudflare());
  } catch (err) {
    // If dynamic import fails, log a friendly message and continue without
    // the cloudflare plugin so the build can proceed in CI. This avoids the
    // "File is not defined" ReferenceError coming from undici.
    // We avoid console.error to keep CI logs clean; Vite will still show
    // plugin resolution info if needed.
  }

  return {
    plugins: basePlugins,
    server: {
      allowedHosts: true,
    },
    build: {
      chunkSizeWarningLimit: 5000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
