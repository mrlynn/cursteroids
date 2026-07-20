import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cursteroids is served as a multi-zone under mlynn.org/cursteroids.
  // The main site rewrites /cursteroids/:path* to this deployment; basePath
  // makes every route and asset live under that prefix so the two zones never
  // collide. Keep in sync with BASE_PATH in src/game/constants.ts.
  basePath: "/cursteroids",

  // The bare deployment root has no route (everything lives under basePath),
  // which leaves a confusing 404 at the naked Vercel URL. Send it to the game.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/cursteroids",
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
