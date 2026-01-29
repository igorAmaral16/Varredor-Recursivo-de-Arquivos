import { useMemo, useState } from "react";
import { isValidDocLen } from "../../utils/validators";
import { toHyphenatedIfPossible } from "../../utils/docFormat";

type Props = {
    onAdd: (doc: string) => void;
};

export function DocumentInput({ onAdd }: Props) {
    const [value, setValue] = useState("");

    const formattedHint = useMemo(() => toHyphenatedIfPossible(value), [value]);
    const valid = useMemo(() => isValidDocLen(value), [value]);

    return (
        <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontWeight: 700 }}>Número do documento</label>

            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="11 blocos de 4 caracteres; hífen entre o 10º e 11º bloco"
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />

            <div style={{ fontSize: 12, color: "#444" }}>
                Formato detectado: <b>{valid ? "OK" : "incompleto"}</b> · Sugestão: <b>{formattedHint}</b>
            </div>

            <button
                onClick={() => {
                    onAdd(value);
                    setValue("");
                }}
                disabled={!valid}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", cursor: valid ? "pointer" : "not-allowed" }}
            >
                Adicionar documento
            </button>
        </div>
    );
}
