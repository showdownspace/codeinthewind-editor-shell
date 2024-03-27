export function once<T>(factory: () => T): () => T {
  let cache: { value: T } | undefined;
  return () => {
    if (!cache) {
      cache = { value: factory() };
    }
    return cache.value;
  };
}
