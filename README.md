# Beyond the Known Universe

Scroll-driven 3D space journey (Three.js r128 + GSAP ScrollTrigger), bundled with Vite.
All 3D content is procedural (shaders and generated geometry), so there are no texture or model files to host.

## Run
    npm install
    npm run dev        # local dev server
    npm run build      # production build into dist/
    npm run preview    # serve the production build locally

## Deploy to Vercel
1. Push this folder to a GitHub repo, then import it at vercel.com/new (Vite is auto-detected; vercel.json is included), or
2. Run `npx vercel --prod` inside this folder.
