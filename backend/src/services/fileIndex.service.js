const { SOURCE_ROOT } = require("../config/paths");
const { isReadableDir, indexFiles } = require("../utils/walker");

let cache = {
    createdAt: 0,
    files: [],
    meta: null
};

const CACHE_TTL_MS = 60_000; // 1 min (ajuste conforme necessidade)

async function getOrBuildIndex(onProgress) {
    const now = Date.now();
    const isFresh = cache.files.length > 0 && (now - cache.createdAt) < CACHE_TTL_MS;

    if (isFresh) {
        return { files: cache.files, meta: cache.meta, cached: true };
    }

    if (!(await isReadableDir(SOURCE_ROOT))) {
        throw new Error(`SOURCE_ROOT inválida ou inacessível: ${SOURCE_ROOT}`);
    }

    const { files, meta } = await indexFiles(SOURCE_ROOT, onProgress);
    cache = { createdAt: now, files, meta };

    return { files, meta, cached: false };
}

module.exports = { getOrBuildIndex };
