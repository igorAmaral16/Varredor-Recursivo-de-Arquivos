import { useMemo, useState } from "react";
import { FileSearch, Plus, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getNormalizedLen, isValidDocLen } from "../../utils/validators";

type Props = {
    onAdd: (doc: string) => void;
    onSearch: () => void;
    canSearch: boolean;
    searching: boolean;
    locked: boolean;
};

function sanitizeInput(value: string) {
    // remove espaços; mantém letras/números e hífen; limita 60 chars digitados
    return value.replace(/\s+/g, "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 60);
}

export function SearchBar({ onAdd, onSearch, canSearch, searching, locked }: Props) {
    const [value, setValue] = useState("");

    const normalizedLen = useMemo(() => getNormalizedLen(value), [value]);
    const valid = useMemo(() => isValidDocLen(value), [value]);

    const statusPill = useMemo(() => {
        if (value.length === 0) return <span className="pill warn">Aguardando entrada</span>;
        if (valid) return <span className="pill ok"><CheckCircle2 size={16} /> Pronto para adicionar</span>;
        return <span className="pill bad"><AlertTriangle size={16} /> 40–60 (normalizado)</span>;
    }, [value.length, valid]);

    const addDisabled = locked || searching || !valid;

    return (
        <div>
            <div className="search-bar">
                <FileSearch className="icon" size={18} />
                <input
                    value={value}
                    onChange={(e) => setValue(sanitizeInput(e.target.value))}
                    placeholder="Cole/digite o documento (40–60). Aceita com ou sem hífen."
                    maxLength={60}
                    readOnly={locked || searching}
                />

                <button
                    className="btn"
                    disabled={addDisabled}
                    onClick={() => {
                        onAdd(value);
                        setValue("");
                    }}
                >
                    <Plus size={18} /> Adicionar
                </button>

                <button
                    className="btn primary"
                    disabled={locked || !canSearch || searching}
                    onClick={onSearch}
                >
                    <Search size={18} /> {searching ? "Analisando..." : "Analisar"}
                </button>
            </div>

            <div className="hint-row">
                <div>
                    <strong>Contagem:</strong> digitado {value.length}/60 · normalizado {normalizedLen}/60
                </div>
                <div>{statusPill}</div>
            </div>
        </div>
    );
}
