/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 1. Prevenir Clickjacking (no permitir embeber la web en iframes maliciosos)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // 2. Prevenir MIME sniffing (forzar que los tipos declarados se respeten)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // 3. Forzar HTTPS estricto durante 2 años incluyendo subdominios
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // 4. Proteger la privacidad del origen del visitante
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 5. Restringir APIs del navegador que la tienda no utiliza
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          // 6. Protección contra inyección de scripts reflejados
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
