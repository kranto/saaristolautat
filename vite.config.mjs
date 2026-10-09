import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function localTimetablePage() {
  return {
    name: 'local-timetable-page',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url, 'http://localhost');
        if (url.pathname !== '/timetable.php') return next();

        const image = url.searchParams.get('t');
        if (!image || image !== image.split('/').pop() || !/\.(jpe?g|png)$/i.test(image)) {
          response.statusCode = 400;
          response.end('Invalid timetable image');
          return;
        }

        const imageUrl = `/data/timetables_jpg/${encodeURIComponent(image)}`;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(`<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body>
  <img src="${imageUrl}" alt="timetable" style="position:absolute;max-width:100%;max-height:100%;top:0;left:0">
  <button type="button" onclick="window.close()" aria-label="Close" style="position:absolute;right:5px;top:5px;width:40px;height:40px;font-size:30px">X</button>
</body>
</html>`);
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), localTimetablePage()],
  build: {
    outDir: 'build',
    rolldownOptions: {
      output: {
        assetFileNames: assetInfo => {
          const sourceName = assetInfo.names?.[0] || assetInfo.name || '';
          return sourceName.endsWith('.mjs')
            ? 'assets/[name]-[hash].js'
            : 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
