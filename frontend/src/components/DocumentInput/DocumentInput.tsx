import { useMemo, useState } from "react";
import { isValidDocLen, getNormalizedLen } from "../../utils/validators";

type Props = {
    onAdd: (doc: string) => void;
    locked: boolean;
    searching: boolean;
};

function sanitizeInput(value: string) {
    return value.replace(/\s+/g, "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 60);
}

export function DocumentInput({ onAdd, locked, searching }: Props) {
    const [value, setValue] = useState("");
    const valid = useMemo(() => isValidDocLen(value), [value]);
    const normalizedLen = useMemo(() => getNormalizedLen(value), [value]);

    return (
        <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontWeight: 700 }}>Número do documento</label>
            <input
                value={value}
                onChange={(e) => setValue(sanitizeInput(e.target.value))}
                placeholder="Cole/digite o documento (40–60). Aceita com ou sem hífen."
                maxLength={60}
                readOnly={locked || searching}
            />

            <div style={{ fontSize: 12, color: "#444" }}>
                Contagem: digitado {value.length}/60 · normalizado {normalizedLen}/60 ·{" "}
                <b>{valid ? "OK" : "inválido (40–60)"}</b>
            </div>

            <button
                onClick={() => {
                    onAdd(value);
                    setValue("");
                }}
                disabled={locked || searching || !valid}
            >
                Adicionar documento
            </button>
        </div>
    );
}
