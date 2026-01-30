const path = require("path");

function addXBeforeExtension(filename) {
    const ext = path.extname(filename);
    const base = filename.slice(0, filename.length - ext.length);
    return `${base}x${ext}`;
}

module.exports = { addXBeforeExtension };
