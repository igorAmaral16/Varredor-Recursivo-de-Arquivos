const asyncHandler = require("../utils/asyncHandler");
const { getOrBuildIndex } = require("../services/fileIndex.service");
const { buildSearchVariants, normalizeDoc } = require("../utils/nameVariants");
const { copyFileToDest } = require("../services/fileOps.service");

function includesInsensitive(haystack, needle) {
    return String(haystack).toLowerCase().includes(String(needle).toLowerCase());
}

const MIN_LEN = 40;
const MAX_LEN = 60;

const search = asyncHandler(async (req, res) => {
    const docs = Array.isArray(req.body?.docs) ? req.body.docs : [];
    if (docs.length === 0) return res.status(400).json({ error: "docs vazio" });

    // validação por doc (não derruba tudo se 1 estiver ruim)
    const invalid = [];
    const validDocs = [];

    for (const d of docs) {
        const n = normalizeDoc(d);
        if (n.length < MIN_LEN || n.length > MAX_LEN) {
            invalid.push({ doc: d, normalizedLength: n.length, rule: `tamanho deve ser ${MIN_LEN}-${MAX_LEN}` });
        } else {
            validDocs.push(d);
        }
    }

    const { files, meta, cached } = await getOrBuildIndex();

    const results = validDocs.map((docRaw) => {
        const variants = buildSearchVariants(docRaw);
        const hits = files.filter((f) => variants.some((v) => includesInsensitive(f.name, v)));
        return {
            doc: docRaw,
            variants,
            hits: hits.map(h => ({ name: h.name, path: h.fullPath }))
        };
    });

    res.json({
        cachedIndex: cached,
        indexMeta: meta,
        invalid,
        results
    });
});

const copy = asyncHandler(async (req, res) => {
    const selections = Array.isArray(req.body?.selections) ? req.body.selections : [];
    if (selections.length === 0) return res.status(400).json({ error: "selections vazio" });

    const copied = [];
    const failed = [];

    for (const s of selections) {
        try {
            const destPath = await copyFileToDest(s.path);
            copied.push({ doc: s.doc, sourcePath: s.path, destPath });
        } catch (err) {
            failed.push({ doc: s.doc, sourcePath: s.path, error: err.message });
        }
    }

    res.json({ copied, failed });
});

module.exports = { search, copy };
