export function normalizeDoc(raw: string) {
    return (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// 11 blocos de 4 => 44 chars; hífen após 40 (entre bloco 10 e 11)
export function toHyphenatedIfPossible(raw: string) {
    const n = normalizeDoc(raw);
    if (n.length !== 44) return raw; // não força se não tiver tamanho completo
    return `${n.slice(0, 40)}-${n.slice(40)}`;
}
