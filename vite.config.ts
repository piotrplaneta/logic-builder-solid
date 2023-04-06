import solid from "solid-start/vite";
import { defineConfig } from "vite";
import devtools from "solid-devtools/vite";

export default defineConfig({
  plugins: [solid(), devtools()],
});
