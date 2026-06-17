import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/", 
        "/payment-verification/", 
        "/api/",
      ],
    },
    sitemap: "https://www.msbteresult.online/sitemap.xml",
  };
}
