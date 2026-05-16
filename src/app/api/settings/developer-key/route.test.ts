import { describe, expect, it, vi } from "vitest";
import { GET, PATCH, POST } from "@/app/api/settings/developer-key/route";

const getAuthenticatedUserOrNull = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/auth", () => ({
  getAuthenticatedUserOrNull,
}));

function createSupabaseStub() {
  return {
    from: (table: string) => {
      if (table !== "public_api_keys") throw new Error("Unexpected table");
      return {
        select: () => ({
          eq: () => ({
            order: async () => ({
              data: [],
              error: null,
            }),
            is: () => ({
              select: () => ({
                maybeSingle: async () => ({
                  data: {
                    id: "key_1",
                    label: "API Key",
                    api_key: "strata_pk_test",
                    revoked_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({
              data: {
                id: "key_1",
                label: "API Key",
                api_key: "strata_pk_test",
                revoked_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
        update: () => ({
          eq: () => ({
            eq: () => ({
              is: () => ({
                select: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: "key_1",
                      label: "API Key",
                      api_key: "strata_pk_test",
                      revoked_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };
    },
  };
}

describe("developer key route", () => {
  it("returns 401 for unauthenticated GET", async () => {
    getAuthenticatedUserOrNull.mockResolvedValue({ user: null, supabase: {} });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("creates key with POST", async () => {
    getAuthenticatedUserOrNull.mockResolvedValue({
      user: { id: "user_1" },
      supabase: createSupabaseStub(),
    });
    const response = await POST(
      new Request("http://localhost/api/settings/developer-key", {
        method: "POST",
        body: JSON.stringify({ label: "Zapier" }),
      }),
    );
    expect(response.status).toBe(201);
  });

  it("revokes key with PATCH", async () => {
    getAuthenticatedUserOrNull.mockResolvedValue({
      user: { id: "user_1" },
      supabase: createSupabaseStub(),
    });
    const response = await PATCH(
      new Request("http://localhost/api/settings/developer-key", {
        method: "PATCH",
        body: JSON.stringify({ keyId: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );
    expect(response.status).toBe(200);
  });
});

