export function failedSourceDiagnostics(sources = []) {
  const failures = new Map();
  function inspect(source, recoveredBy) {
    if (!source || typeof source !== 'object') return;
    if (source.status !== 'success') {
      failures.set(`${source.id ?? ''}:${source.url ?? ''}`, {
        ...source,
        ...(recoveredBy ? { recoveredBy } : {}),
      });
    }
    if (source.upstream) inspect(source.upstream, source.status === 'success' ? source.id : undefined);
  }
  for (const source of sources) inspect(source);
  return [...failures.values()];
}
