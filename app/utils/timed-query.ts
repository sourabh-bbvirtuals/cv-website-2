export async function timedQuery<T>(queryName: string, fn: () => Promise<T>) {
  const start = Date.now();
  const result = await fn();
  const end = Date.now();
  console.log(`[GRAPHQL] ${queryName} took ${end - start}ms`);
  return result;
}
