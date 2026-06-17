import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.msbteresult.online";
  
  // Publicly crawlable routes
  const routes = [
    "",
    "/result",
    "/pricing",
    "/contact",
    "/privacy",
    "/terms",
    "/refunds",
    "/auth/login",
    "/auth/signup",
  ];

  return routes.map((route) => {
    // Higher priority for landing page and result checker page
    let priority = 0.5;
    let changeFrequency: "daily" | "weekly" | "monthly" | "yearly" | "always" | "never" = "monthly";

    if (route === "") {
      priority = 1.0;
      changeFrequency = "daily";
    } else if (route === "/result") {
      priority = 0.9;
      changeFrequency = "daily";
    } else if (route === "/pricing") {
      priority = 0.8;
      changeFrequency = "weekly";
    } else if (route === "/contact") {
      priority = 0.7;
      changeFrequency = "monthly";
    }

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    };
  });
}
