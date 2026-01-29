const path = require("path");
const fsp = require("fs/promises");

function addXBeforeExtension(filename) {
    const ext = path.extname(filename);
    const base = filename.slice(0, filename.length - ext.length);
    return `${base}x${ext}`;
}

async function uniqueDestPath(destDir, filename) {
    const ext = path.extname(filename);
    const base = filename.slice(0, filename.length - ext.length);

    let candidate = path.join(destDir, filename);
    let i = 2;

    while (true) {
        try {
            await fsp.access(candidate);
            candidate = path.join(destDir, `${base}_${i}${ext}`);
            i++;
        } catch {
            return candidate;
        }
    }
}

module.exports = { addXBeforeExtension, uniqueDestPath };
