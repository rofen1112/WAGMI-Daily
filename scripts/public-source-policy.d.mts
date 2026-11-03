export function isInternalSourceUrl(value: unknown): boolean;
export function isInternalSource(source: { url?: unknown; visibility?: unknown } | null | undefined): boolean;
export function sanitizePublicReport(value: string): string;
export function toPublicSnapshot<T>(value: T): T;
