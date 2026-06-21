import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lifesycle/crm-mock", "@lifesycle/zoom-client"],
  serverExternalPackages: ["better-sqlite3"]
};

export default nextConfig;
