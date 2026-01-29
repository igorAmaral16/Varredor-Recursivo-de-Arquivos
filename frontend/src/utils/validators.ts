import { normalizeDoc } from "./docFormat";

export function getNormalizedLen(raw: string) {
    return normalizeDoc(raw).length;
}

export function isValidDocLen(raw: string) {
    const len = getNormalizedLen(raw);
    return len >= 40 && len <= 60;
}
