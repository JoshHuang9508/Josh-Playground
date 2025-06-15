/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.whydog.xyz",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/tools/*", "/projects/*"],
};
