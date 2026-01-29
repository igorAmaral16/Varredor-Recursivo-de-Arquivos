import { useState } from "react";
import type { SearchResponse } from "../src/types";
import { searchDocs, copyFiles } from "../src/services/searchApi";
import { SearchBar } from "../src/components/SearchBar/SearchBar";
import { DocumentQueue } from "../src/components/DocumentQueue/DocumentQueue";
import { SearchResults } from "../src/components/SearchResults/SearchResults";
import { Info } from "lucide-react";

import LogoAbr from "../src/assets/LogoAbr.png";

export default function App() {
  const [docs, setDocs] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "searching" | "searched" | "copying" | "done" | "error">("idle");
  const [message, setMessage] = useState("Adicione documentos (40–60) e clique em Pesquisar.");
  const [response, setResponse] = useState<SearchResponse | null>(null);

  const addDoc = (doc: string) => {
    setDocs(prev => [...prev, doc]);
    setStatus("idle");
    setMessage("Documento adicionado à fila.");
  };

  const removeDoc = (idx: number) => {
    setDocs(prev => prev.filter((_, i) => i !== idx));
  };

  const clear = () => {
    setDocs([]);
    setResponse(null);
    setStatus("idle");
    setMessage("Fila limpa.");
  };

  const doSearch = async () => {
    if (docs.length === 0) return;

    setStatus("searching");
    setMessage("Pesquisando na pasta fixa. Aguarde…");
    setResponse(null);

    try {
      const data = await searchDocs(docs);
      setResponse(data);
      setStatus("searched");

      const invalid = data.invalid?.length ?? 0;
      if (invalid > 0) {
        setMessage(`Pesquisa concluída. ${invalid} documento(s) ignorado(s) por tamanho inválido.`);
      } else {
        setMessage("Pesquisa concluída. Revise os resultados e envie para a pasta de saída.");
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(`Falha na pesquisa: ${e?.message ?? "erro desconhecido"}`);
    }
  };

  const doCopy = async (selections: { doc: string; path: string }[]) => {
    setStatus("copying");
    setMessage("Copiando arquivos para a pasta de saída e renomeando com 'x'…");

    try {
      const out = await copyFiles(selections);
      const ok = out.copied.length;
      const fail = out.failed.length;

      setStatus("done");
      setMessage(`Finalizado. Sucesso: ${ok}. Falhas: ${fail}.`);
    } catch (e: any) {
      setStatus("error");
      setMessage(`Falha ao copiar: ${e?.message ?? "erro desconhecido"}`);
    }
  };

  return (
    <div className="consulta-page">
      <div className="consulta-container">
        <div className="header">
          <div className="brand">
            <img src={LogoAbr} alt="Logo" />
            <div>
              <h1>Busca e envio de arquivos</h1>
              <p className="sub">Digite 40–60 caracteres (máx. 60). A busca considera com e sem hífen.</p>
            </div>
          </div>

          <span className={status === "error" ? "pill bad" : status === "done" ? "pill ok" : "pill warn"}>
            <Info size={16} /> {message}
          </span>
        </div>

        <div className="grid">
          <div className="card">
            <SearchBar
              onAdd={addDoc}
              onSearch={doSearch}
              canSearch={docs.length > 0}
              searching={status === "searching"}
            />
            <div className="hr" />
            <div className="small">
              Dica: você pode adicionar vários documentos e pesquisar tudo de uma vez (fila).
            </div>
          </div>

          <div className="card">
            <DocumentQueue docs={docs} onRemove={removeDoc} onClear={clear} />
          </div>
        </div>

        {response && (
          <SearchResults response={response} onCopy={doCopy} copying={status === "copying"} />
        )}
      </div>
    </div>
  );
}
