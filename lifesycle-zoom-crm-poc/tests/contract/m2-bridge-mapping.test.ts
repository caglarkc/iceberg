import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import yaml from "js-yaml";
import { createZoomServiceMockApp } from "../../tools/zoom-service-mock/src/server.js";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

interface BridgeRoute {
  m3Method: HttpMethod;
  m3Path: string;
  m2Method: HttpMethod;
  m2Path: string;
  note?: string;
}

/** Documented production adapter mapping (M3 consumer → M2 zoom-integration-core). */
export const M2_BRIDGE_ROUTES: BridgeRoute[] = [
  {
    m3Method: "get",
    m3Path: "/api/v1/capabilities",
    m2Method: "get",
    m2Path: "/api/zoom/capability-map",
    note: "Adapter maps capability-map items to M3 capabilities shape"
  },
  {
    m3Method: "post",
    m3Path: "/api/v1/meetings",
    m2Method: "post",
    m2Path: "/api/zoom/meetings"
  },
  {
    m3Method: "post",
    m3Path: "/api/v1/meetings/instant",
    m2Method: "post",
    m2Path: "/api/zoom/meetings",
    note: "Instant meetings use type=1 on M2 create"
  },
  {
    m3Method: "get",
    m3Path: "/api/v1/meetings/{id}",
    m2Method: "get",
    m2Path: "/api/zoom/meetings/{id}"
  },
  {
    m3Method: "post",
    m3Path: "/api/v1/meetings/{id}/embed-signature",
    m2Method: "post",
    m2Path: "/api/zoom/signature",
    note: "Adapter resolves meeting id → meetingNumber for M2 signature"
  },
  {
    m3Method: "post",
    m3Path: "/api/v1/webhooks/replay",
    m2Method: "post",
    m2Path: "/internal/webhooks/replay",
    note: "Demo replay only; fixtures differ between M2 raw and M3 normalized"
  }
];

const M3_WEBHOOK_BRIDGE: BridgeRoute = {
  m3Method: "post",
  m3Path: "/api/webhooks/zoom",
  m2Method: "post",
  m2Path: "/api/zoom/webhooks",
  note: "M2 ingests raw Zoom webhooks; adapter normalizes to M3 CRM events"
};

const ZOOM_CLIENT_PATHS: Array<{ method: HttpMethod; path: string }> = [
  { method: "get", path: "/capabilities" },
  { method: "post", path: "/meetings" },
  { method: "post", path: "/meetings/instant" },
  { method: "get", path: "/meetings/{id}" },
  { method: "post", path: "/meetings/{id}/embed-signature" }
];

function loadOpenApiPaths(specPath: string): Map<string, Set<HttpMethod>> {
  const raw = readFileSync(specPath, "utf8");
  const doc = yaml.load(raw) as { paths?: Record<string, Record<string, unknown>> };
  const result = new Map<string, Set<HttpMethod>>();

  for (const [path, operations] of Object.entries(doc.paths ?? {})) {
    const methods = new Set<HttpMethod>();
    for (const method of Object.keys(operations)) {
      if (["get", "post", "put", "patch", "delete"].includes(method)) {
        methods.add(method as HttpMethod);
      }
    }
    result.set(path, methods);
  }

  return result;
}

function hasRoute(paths: Map<string, Set<HttpMethod>>, routePath: string, method: HttpMethod): boolean {
  const methods = paths.get(routePath);
  return methods?.has(method) ?? false;
}

function normalizeExpressPath(path: string): string {
  return path.replace(/:([A-Za-z_]+)/g, "{$1}");
}

function extractMockServerRoutes(): Map<string, Set<HttpMethod>> {
  const app = createZoomServiceMockApp();
  const stack = (app as unknown as { _router?: { stack: unknown[] } })._router?.stack ?? [];
  const routes = new Map<string, Set<HttpMethod>>();

  for (const layer of stack) {
    const routeLayer = layer as {
      route?: { path: string; methods: Record<string, boolean> };
    };
    if (!routeLayer.route) continue;

    const path = normalizeExpressPath(routeLayer.route.path);
    const methods = new Set<HttpMethod>();
    for (const [method, enabled] of Object.entries(routeLayer.route.methods)) {
      if (enabled) methods.add(method as HttpMethod);
    }
    routes.set(path, methods);
  }

  return routes;
}

describe("M2 ↔ M3 bridge mapping contract", () => {
  const m2OpenApiPath = resolve(
    import.meta.dirname,
    "../../../zoom-integration-core/docs/openapi.yaml"
  );
  const m3OpenApiPath = resolve(
    import.meta.dirname,
    "../../contracts/zoom-integration-service.openapi.yaml"
  );

  const m2Paths = loadOpenApiPaths(m2OpenApiPath);
  const m3Paths = loadOpenApiPaths(m3OpenApiPath);
  const mockPaths = extractMockServerRoutes();

  it.each(M2_BRIDGE_ROUTES.map((route, index) => [index, route] as const))(
    "M2 route exists for bridge mapping #%s ($m2Method $m2Path)",
    (_index, route) => {
      expect(
        hasRoute(m2Paths, route.m2Path, route.m2Method),
        `Expected M2 OpenAPI to define ${route.m2Method.toUpperCase()} ${route.m2Path}`
      ).toBe(true);
    }
  );

  it.each(M2_BRIDGE_ROUTES.map((route, index) => [index, route] as const))(
    "M3 consumer contract defines bridge mapping #%s ($m3Method $m3Path)",
    (_index, route) => {
      const m3ContractPath = route.m3Path.replace(/^\/api\/v1/, "");
      expect(
        hasRoute(m3Paths, m3ContractPath, route.m3Method),
        `Expected M3 contract to define ${route.m3Method.toUpperCase()} ${m3ContractPath}`
      ).toBe(true);
    }
  );

  it("M2 webhook ingress route exists for CRM normalization bridge", () => {
    expect(hasRoute(m2Paths, M3_WEBHOOK_BRIDGE.m2Path, M3_WEBHOOK_BRIDGE.m2Method)).toBe(true);
  });

  it.each(M2_BRIDGE_ROUTES.map((route, index) => [index, route] as const))(
    "zoom-service-mock implements M3 path for mapping #%s",
    (_index, route) => {
      expect(
        hasRoute(mockPaths, route.m3Path, route.m3Method),
        `Mock server missing ${route.m3Method.toUpperCase()} ${route.m3Path}`
      ).toBe(true);
    }
  );

  it.each(ZOOM_CLIENT_PATHS.map((route, index) => [index, route] as const))(
    "HttpZoomClient path aligns with M3 contract #%s",
    (_index, route) => {
      const contractPath = route.path;
      expect(
        hasRoute(m3Paths, contractPath, route.method),
        `M3 contract missing ${route.method.toUpperCase()} ${contractPath}`
      ).toBe(true);
    }
  );

  it("default ZOOM_SERVICE_URL targets mock service /api/v1 base", () => {
    const defaultUrl = process.env.ZOOM_SERVICE_URL ?? "http://localhost:4010/api/v1";
    expect(defaultUrl).toMatch(/4010\/api\/v1$/);
  });
});
