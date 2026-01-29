const fsp = require("fs/promises");
const path = require("path");
const { DEST_ROOT } = require("../config/paths");
const { addXBeforeExtension, uniqueDestPath } = require("../utils/fileName");

async function ensureDestDir() {
    await fsp.mkdir(DEST_ROOT, { recursive: true });
}

async function copyFileToDest(sourcePath) {
    await ensureDestDir();

    const baseName = path.basename(sourcePath);
    const outName = addXBeforeExtension(baseName);
    const outPath = await uniqueDestPath(DEST_ROOT, outName);

    await fsp.copyFile(sourcePath, outPath);
    return outPath;
}

module.exports = { copyFileToDest };
