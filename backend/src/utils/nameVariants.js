function normalizeDoc(raw) {
    return String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function hyphenateAfter40(normalized) {
    if (normalized.length <= 40) return normalized;
    return `${normalized.slice(0, 40)}-${normalized.slice(40)}`;
}

// Variantes para busca ambígua: com e sem hífen
function buildSearchVariants(raw) {
    const n = normalizeDoc(raw);
    const variants = new Set();

    // sem hífen (normalizado)
    if (n) variants.add(n);

    // com hífen após 40 (se aplicável)
    if (n.length > 40) variants.add(hyphenateAfter40(n));

    // se o usuário digitou com hífen, também gerar sem hífen “equivalente”
    const rawNoHyphen = String(raw || "").replace(/-/g, "");
    const nn = normalizeDoc(rawNoHyphen);
    if (nn) variants.add(nn);
    if (nn.length > 40) variants.add(hyphenateAfter40(nn));

    return Array.from(variants);
}

module.exports = { normalizeDoc, hyphenateAfter40, buildSearchVariants };
