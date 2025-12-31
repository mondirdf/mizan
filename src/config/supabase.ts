// Supabase configuration for API calls
// These are publishable keys - safe to include in frontend code

export const SUPABASE_URL = "https://voqhuievpxdygxpdijxp.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_Q0SMRph_L548lQd1nO9PMg_UQzl5UDK";

// Helper function to call Supabase Edge Functions
export async function callEdgeFunction<T>(
  functionName: string,
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );

  if (!response.ok) {
    throw new Error(`Edge function error: ${response.statusText}`);
  }

  return response.json();
}
