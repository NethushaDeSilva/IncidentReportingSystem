import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function tailwindDarkVariant() {
  return {
    name: 'healthlink-tailwind-dark-variant',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replaceAll('\\', '/')
      if (!normalizedId.endsWith('/src/index.css')) return null

      return {
        code: `@custom-variant dark (&:where(.dark, .dark *));\n${code}`,
        map: null,
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindDarkVariant(), tailwindcss()],
  build: {
    cssCodeSplit: true,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@firebase/firestore") || id.includes("firebase/firestore")) return "firebase-firestore";
          if (id.includes("@firebase/auth") || id.includes("firebase/auth")) return "firebase-auth";
          if (id.includes("@firebase/app") || id.includes("firebase/app")) return "firebase-core";
          if (id.includes("firebase")) return "firebase-shared";
          if (id.includes("react")) return "react-vendor";
          if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("dompurify")) return "pdf-vendor";
          if (id.includes("lucide-react")) return "icons-vendor";
          return "vendor";
        },
      },
    },
  },
})
