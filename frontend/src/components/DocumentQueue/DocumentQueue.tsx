import { Trash2, Hash, CopyX } from "lucide-react";
import { getNormalizedLen, isValidDocLen } from "../../utils/validators";

type Props = {
    docs: string[];
    onRemove: (idx: number) => void;
    onClear: () => void;
};

export function DocumentQueue({ docs, onRemove, onClear }: Props) {
    const seen = new Set<string>();
    const dupCount = docs.reduce((acc, d) => {
        const key = d.toUpperCase();
        if (seen.has(key)) return acc + 1;
        seen.add(key);
        return acc;
    }, 0);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                    <div style={{ fontWeight: 700, color: "var(--primary-dark)" }}>Fila de documentos</div>
                    <div className="small">
                        Total: <b>{docs.length}</b> · Duplicados: <b>{dupCount}</b>
                    </div>
                </div>

                <button className="btn" onClick={onClear} disabled={docs.length === 0}>
                    <Trash2 size={18} /> Limpar
                </button>
            </div>

            <div className="queue">
                {docs.length === 0 ? (
                    <div className="small">Adicione documentos para iniciar a pesquisa.</div>
                ) : (
                    docs.map((d, i) => {
                        const len = getNormalizedLen(d);
                        const ok = isValidDocLen(d);

                        return (
                            <div key={`${d}-${i}`} className="queue-item">
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Hash size={16} className="icon" />
                                        <div className="mono" style={{ wordBreak: "break-all" }}>{d}</div>
                                    </div>
                                    <div className="small" style={{ marginTop: 6 }}>
                                        Normalizado: <b>{len}</b> · Regra: <b>40–60</b>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {ok ? (
                                        <span className="pill ok"><CopyX size={16} /> válido</span>
                                    ) : (
                                        <span className="pill bad"><CopyX size={16} /> inválido</span>
                                    )}
                                    <button className="btn" onClick={() => onRemove(i)}>
                                        <Trash2 size={18} /> Remover
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
