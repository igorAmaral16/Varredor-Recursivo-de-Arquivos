const fsp = require("fs/promises");
const path = require("path");

async function isReadableDir(p) {
    try {
        const st = await fsp.lstat(p);
        return st.isDirectory();
    } catch {
        return false;
    }
}

// Varre recursivamente e retorna somente arquivos (com { fullPath, name })
async function indexFiles(rootDir, onProgress) {
    const files = [];
    const stack = [rootDir];
    const visited = new Set();

    let dirsVisited = 0;
    let itemsChecked = 0;
    let errors = 0;

    while (stack.length) {
        const currentDir = stack.pop();
        dirsVisited++;

        if (onProgress) onProgress({ stage: "walk", currentDir, dirsVisited, itemsChecked, errors });

        // evita loops em symlinks (quando realpath funcionar)
        const real = await fsp.realpath(currentDir).catch(() => null);
        if (real) {
            if (visited.has(real)) continue;
            visited.add(real);
        }

        let entries;
        try {
            entries = await fsp.readdir(currentDir, { withFileTypes: true });
        } catch {
            errors++;
            continue;
        }

        for (const ent of entries) {
            itemsChecked++;
            const fullPath = path.join(currentDir, ent.name);

            if (ent.isDirectory()) {
                stack.push(fullPath);
                continue;
            }

            if (ent.isFile()) {
                files.push({ fullPath, name: ent.name });
                continue;
            }

            if (ent.isSymbolicLink()) {
                const st = await fsp.stat(fullPath).catch(() => null);
                if (!st) continue;
                if (st.isDirectory()) stack.push(fullPath);
                if (st.isFile()) files.push({ fullPath, name: ent.name });
            }
        }
    }

    return { files, meta: { dirsVisited, itemsChecked, errors } };
}

module.exports = { isReadableDir, indexFiles };
