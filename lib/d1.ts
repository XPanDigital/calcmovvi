type Row = Record<string, unknown>;
type QueryResult = { results: Row[]; meta: { changes: number } };

// This module is imported only by server routes. Never use NEXT_PUBLIC_ for these variables.
export function productDb() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const database = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !database || !token) throw new Error('D1_NOT_CONFIGURED');
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(database)}/query`;

  function prepare(sql: string, params: (string | number)[] = []) {
    async function execute(): Promise<QueryResult> {
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, params: params.map(String) }),
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`D1_HTTP_${response.status}`);
      const data = await response.json();
      const result = data.result?.[0];
      if (data.success !== true || result?.success !== true || !Array.isArray(result.results)) {
        throw new Error('D1_QUERY_FAILED');
      }
      return { results: result.results, meta: { changes: result.meta?.changes ?? 0 } };
    }
    return {
      bind: (...values: (string | number)[]) => prepare(sql, values),
      all: execute,
      run: execute,
      first: async () => (await execute()).results[0] ?? null,
    };
  }
  return { prepare };
}
