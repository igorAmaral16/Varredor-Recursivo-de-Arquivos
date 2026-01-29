"use strict";

const fsp = require("fs/promises");
const path = require("path");

// >>>>> PASTAS FIXAS
const SOURCE_ROOT = "V:\\ProdNFeiIN\\input_done";
const DEST_ROOT = "V:\\ProdNFeiIN\\input";

function now() {
    const d = new Date();
    return d.toISOString().replace("T", " ").replace("Z", "");
}

function norm(s) {
    return String(s ?? "").toLowerCase();
}

function printHelpAndExit(code = 0) {
    console.log(`
Uso:
  node buscar_copiar_fila.js "termo1" "termo2" "termo3" ...

Exemplo:
  node buscar_copiar_fila.js "oo" "zoom" "relatorio"

Pastas fixas:
  Busca em:  ${SOURCE_ROOT}
  Copia p/: ${DEST_ROOT}

Regras:
  - Busca por parte do NOME do arquivo (case-insensitive).
  - Copia arquivos encontrados para a pasta de saída.
  - Adiciona "x" antes da extensão no nome do arquivo copiado.
`.trim());
    process.exit(code);
}

async function ensureDir(p) {
    await fsp.mkdir(p, { recursive: true });
}

async function isReadableDir(p) {
    try {
        const st = await fsp.lstat(p);
        return st.isDirectory();
    } catch {
        return false;
    }
}

function addXBeforeExtension(filename) {
    const ext = path.extname(filename);          // ".txt" ou ".gz" ou ""
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
            // existe => gera outro
            candidate = path.join(destDir, `${base}_${i}${ext}`);
            i++;
        } catch {
            // não existe => ok
            return candidate;
        }
    }
}

async function indexFilesVerbose(rootDir) {
    const files = [];
    const stack = [rootDir];

    let dirsVisited = 0;
    let itemsChecked = 0;
    let errors = 0;

    // Evita loops por symlink quando possível
    const visitedRealPaths = new Set();

    console.log(`[INFO] Início indexação: ${now()}`);
    console.log(`[INFO] Raiz fixa: ${rootDir}\n`);

    while (stack.length) {
        const currentDir = stack.pop();
        console.log(`[DIR ] ${currentDir}`);
        dirsVisited++;

        // Evita loop via realpath
        try {
            const real = await fsp.realpath(currentDir).catch(() => null);
            if (real) {
                if (visitedRealPaths.has(real)) {
                    console.log(`  [SKIP] Loop detectado (realpath repetido): ${real}\n`);
                    continue;
                }
                visitedRealPaths.add(real);
            }
        } catch {
            // ignora
        }

        let entries;
        try {
            entries = await fsp.readdir(currentDir, { withFileTypes: true });
        } catch (err) {
            errors++;
            console.log(`  [ERR ] Não consegui ler diretório: ${err.message}\n`);
            continue;
        }

        for (const ent of entries) {
            const fullPath = path.join(currentDir, ent.name);
            itemsChecked++;

            const kind = ent.isDirectory()
                ? "DIR "
                : ent.isFile()
                    ? "FILE"
                    : ent.isSymbolicLink()
                        ? "LINK"
                        : "OTHR";

            console.log(`  [CHK ] (${kind}) ${fullPath}`);

            if (ent.isDirectory()) {
                stack.push(fullPath);
                continue;
            }

            if (ent.isFile()) {
                files.push({ fullPath, name: ent.name });
                continue;
            }

            // Se for symlink, indexa se apontar para arquivo (e entra se apontar para diretório)
            if (ent.isSymbolicLink()) {
                try {
                    const st = await fsp.stat(fullPath).catch(() => null);
                    if (!st) continue;

                    if (st.isDirectory()) {
                        console.log(`  [INFO] Link -> diretório, entrando: ${fullPath}`);
                        stack.push(fullPath);
                    } else if (st.isFile()) {
                        console.log(`  [INFO] Link -> arquivo, indexando: ${fullPath}`);
                        files.push({ fullPath, name: ent.name });
                    }
                } catch {
                    // ignora
                }
            }
        }

        console.log("");
    }

    console.log("==================================================");
    console.log(`[INFO] Fim indexação: ${now()}`);
    console.log(`[INFO] Diretórios visitados: ${dirsVisited}`);
    console.log(`[INFO] Itens checados: ${itemsChecked}`);
    console.log(`[INFO] Erros de leitura: ${errors}`);
    console.log(`[INFO] Arquivos indexados: ${files.length}`);
    console.log("==================================================\n");

    return files;
}

function findMatchesForTerm(filesIndex, termRaw) {
    const term = norm(termRaw).trim();
    if (!term) return { termRaw, term, exact: [], partial: [] };

    const exact = [];
    const partial = [];

    for (const f of filesIndex) {
        const nameL = norm(f.name);
        if (nameL === term) exact.push(f);
        else if (nameL.includes(term)) partial.push(f);
    }

    return { termRaw, term, exact, partial };
}

async function copyMatches(matches, destDir) {
    let copied = 0;

    for (const m of matches) {
        const src = m.fullPath;
        const outName = addXBeforeExtension(m.name);
        const outPath = await uniqueDestPath(destDir, outName);

        try {
            await fsp.copyFile(src, outPath);
            copied++;
            console.log(`  [COPY] ${src}`);
            console.log(`        -> ${outPath}`);
        } catch (err) {
            console.log(`  [ERR ] Falha ao copiar: ${src}`);
            console.log(`        Motivo: ${err.message}`);
        }
    }

    return copied;
}

async function main() {
    const terms = process.argv.slice(2);

    if (terms.length === 0 || terms.includes("-h") || terms.includes("--help")) {
        printHelpAndExit(terms.length === 0 ? 1 : 0);
    }

    // Valida pastas fixas
    if (!(await isReadableDir(SOURCE_ROOT))) {
        console.error(`[FATAL] Pasta de busca fixa inválida ou inacessível: ${SOURCE_ROOT}`);
        process.exit(1);
    }

    await ensureDir(DEST_ROOT);

    console.log(`[INFO] Início: ${now()}`);
    console.log(`[INFO] Busca fixa em: ${SOURCE_ROOT}`);
    console.log(`[INFO] Saída fixa em:  ${DEST_ROOT}`);
    console.log(`[INFO] Fila de termos (${terms.length}): ${terms.map(t => `"${t}"`).join(", ")}\n`);

    // 1) Varre uma única vez e cria o índice (com logs)
    const filesIndex = await indexFilesVerbose(SOURCE_ROOT);

    // 2) Processa a fila do primeiro ao último
    let totalCopied = 0;
    let totalFound = 0;

    for (let i = 0; i < terms.length; i++) {
        const termRaw = terms[i];
        console.log(`================== [FILA ${i + 1}/${terms.length}] ==================`);
        console.log(`[TERM] Procurando por: "${termRaw}"`);

        const { exact, partial } = findMatchesForTerm(filesIndex, termRaw);

        // Escolha: se houver exatos, copia exatos; senão copia parciais
        const chosen = exact.length > 0 ? exact : partial;

        console.log(`[INFO] Matches exatos:   ${exact.length}`);
        console.log(`[INFO] Matches parciais: ${partial.length}`);
        console.log(`[INFO] Selecionados p/ cópia: ${chosen.length}`);

        if (chosen.length === 0) {
            console.log("[INFO] Nenhum arquivo encontrado para este termo.\n");
            continue;
        }

        // Lista claramente os encontrados
        console.log("[HIT ] Arquivos selecionados:");
        for (const m of chosen) console.log(`  - ${m.fullPath}`);

        // Copia
        console.log("\n[INFO] Iniciando cópia (com 'x' antes da extensão)...");
        const copied = await copyMatches(chosen, DEST_ROOT);

        totalFound += chosen.length;
        totalCopied += copied;

        console.log(`[INFO] Termo "${termRaw}": selecionados=${chosen.length}, copiados=${copied}\n`);
    }

    // Resumo final
    console.log("==================================================");
    console.log(`[INFO] Fim: ${now()}`);
    console.log(`[INFO] Termos processados: ${terms.length}`);
    console.log(`[INFO] Arquivos encontrados (selecionados): ${totalFound}`);
    console.log(`[INFO] Arquivos copiados com sucesso: ${totalCopied}`);
    console.log(`[INFO] Destino: ${DEST_ROOT}`);
    console.log("==================================================");
}

main().catch((err) => {
    console.error("[FATAL] Falha inesperada:", err);
    process.exit(1);
});
