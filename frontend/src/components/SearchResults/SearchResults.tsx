import type { SearchResponse, CopySelection } from "../../types";
import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, FolderInput } from "lucide-react";

type Props = {
    response: SearchResponse;
    onCopy: (selections: CopySelection[]) => void;
    copying: boolean;
};

export function SearchResults({ response, onCopy, copying }: Props) {
    const [selected, setSelected] = useState<Record<string, string>>({});

    const selections = useMemo(() => {
        const out: CopySelection[] = [];
        for (const r of response.results) {
            const chosenPath =
                selected[r.doc] || (r.hits.length === 1 ? r.hits[0].path : "");
            if (chosenPath) out.push({ doc: r.doc, path: chosenPath });
        }
        return out;
    }, [response.results, selected]);

    const hasAnyHits = response.results.some(r => r.hits.length > 0);

    return (
        <div className="card" style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                    <div style={{ fontWeight: 700, color: "var(--primary-dark)" }}>Resultados</div>
                    <div className="small">
                        Índice: <b>{response.cachedIndex ? "cache" : "novo"}</b> · Pastas: <b>{response.indexMeta?.dirsVisited ?? 0}</b> ·
                        Itens: <b>{response.indexMeta?.itemsChecked ?? 0}</b> · Erros: <b>{response.indexMeta?.errors ?? 0}</b>
                    </div>
                </div>

                <div>
                    {hasAnyHits ? (
                        <span className="pill ok"><CheckCircle2 size={16} /> arquivos encontrados</span>
                    ) : (
                        <span className="pill bad"><AlertTriangle size={16} /> nenhum arquivo encontrado</span>
                    )}
                </div>
            </div>

            {response.invalid.length > 0 && (
                <>
                    <div className="hr" />
                    <div className="pill warn" style={{ width: "fit-content" }}>
                        <AlertTriangle size={16} /> {response.invalid.length} documento(s) ignorado(s) por tamanho inválido
                    </div>
                    <div className="small" style={{ marginTop: 8 }}>
                        {response.invalid.map((x) => (
                            <div key={x.doc}>
                                <span className="mono">{x.doc}</span> · normalizado {x.normalizedLength} · {x.rule}
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="hr" />

            {response.results.map((r) => (
                <div key={r.doc} className="result-card">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700 }}>Documento: <span className="mono">{r.doc}</span></div>
                            <div className="small" style={{ marginTop: 6 }}>
                                Variantes buscadas: {r.variants.map(v => <span key={v} className="mono" style={{ marginRight: 8 }}>{v}</span>)}
                            </div>
                        </div>

                        {r.hits.length === 0 ? (
                            <span className="pill bad"><AlertTriangle size={16} /> não encontrado</span>
                        ) : r.hits.length === 1 ? (
                            <span className="pill ok"><CheckCircle2 size={16} /> 1 encontrado</span>
                        ) : (
                            <span className="pill warn"><AlertTriangle size={16} /> múltiplos</span>
                        )}
                    </div>

                    {r.hits.length === 0 ? (
                        <div className="small" style={{ marginTop: 10 }}>Nenhum arquivo compatível localizado.</div>
                    ) : r.hits.length === 1 ? (
                        <div className="small" style={{ marginTop: 10 }}>
                            Caminho: <span className="mono">{r.hits[0].path}</span>
                        </div>
                    ) : (
                        <div style={{ marginTop: 10 }}>
                            <div className="small">Selecione qual arquivo enviar:</div>
                            <select
                                className="select"
                                value={selected[r.doc] ?? ""}
                                onChange={(e) => setSelected(prev => ({ ...prev, [r.doc]: e.target.value }))}
                            >
                                <option value="">Selecione…</option>
                                {r.hits.map(h => (
                                    <option key={h.path} value={h.path}>{h.path}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            ))}

            <div className="actions">
                <button
                    className="btn primary"
                    onClick={() => onCopy(selections)}
                    disabled={!hasAnyHits || selections.length === 0 || copying}
                >
                    <FolderInput size={18} />
                    {copying ? "LISTANDO NFS..." : "Listar NFs"}
                </button>

                <div className="small" style={{ alignSelf: "center" }}>
                    Selecionados para envio: <b>{selections.length}</b>
                </div>
            </div>
        </div>
    );
}
