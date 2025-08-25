export async function getServerSideProps({ res }) {
  const baseUrl = "https://madani-book.me";

  const pages = [
    { url: "/", changefreq: "daily", priority: 1.0 },
    { url: "/features", changefreq: "weekly", priority: 0.8 },
    { url: "/pricing", changefreq: "weekly", priority: 0.8 },
    { url: "/contact", changefreq: "monthly", priority: 0.6 },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages
      .map(
        (p) => `
      <url>
        <loc>${baseUrl}${p.url}</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>${p.changefreq}</changefreq>
        <priority>${p.priority}</priority>
      </url>`
      )
      .join("")}
  </urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
