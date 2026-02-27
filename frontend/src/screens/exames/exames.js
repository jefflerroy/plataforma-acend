import "./exames.css";
import { Header } from "../../components/header/header";
import { MdFileDownload, MdFileUpload } from "react-icons/md";
import { Select } from "../../components/select/select";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

export function Exames() {
  const fileRef = useRef(null);

  const [tipo, setTipo] = useState("");
  const [arquivo, setArquivo] = useState(null);

  const [exames, setExames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const tipos = useMemo(
    () => [
      { value: "", label: "Selecione um tipo" },
      { value: "Hemograma", label: "Hemograma" },
      { value: "Glicemia", label: "Glicemia" },
      { value: "Colesterol", label: "Colesterol" },
      { value: "Triglicerídeos", label: "Triglicerídeos" },
      { value: "TSH", label: "TSH" },
      { value: "T4", label: "T4" },
      { value: "Vitamina D", label: "Vitamina D" },
      { value: "Outro", label: "Outro" },
    ],
    []
  );

  async function carregar() {
    try {
      setLoading(true);
      const res = await api.get("/meus-exames");
      setExames(Array.isArray(res.data) ? res.data : []);
    } catch {
      setExames([]);
      toast.error("Erro ao carregar exames");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function handleFile(e) {
    const f = e.target.files?.[0] || null;
    setArquivo(f);
  }

  async function enviar() {
    if (!tipo) {
      toast.error("Selecione o tipo do exame");
      return;
    }

    if (!arquivo) {
      toast.error("Selecione um arquivo");
      return;
    }

    try {
      setEnviando(true);

      const formData = new FormData();
      formData.append("tipo", tipo);
      formData.append("arquivo", arquivo);

      await api.post("/exames", formData);

      toast.success("Exame enviado");

      setTipo("");
      setArquivo(null);
      if (fileRef.current) fileRef.current.value = "";

      await carregar();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erro ao enviar exame");
    } finally {
      setEnviando(false);
    }
  }

  function formatarData(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR");
  }

  async function baixar(exame) {
    try {
      const response = await api.get(`/exames/${exame.id}/arquivo`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: exame.mime || response.headers?.["content-type"] || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erro ao abrir arquivo");
    }
  }

  return (
    <>
      <Header nome="Exames" />
      <div className="exames">
        <div className="lista">
          <div className="cabecalho">
            <Select value={tipo} onChange={(v) => setTipo(v)} options={tipos} />

            <input type="file" ref={fileRef} onChange={handleFile} />
            <MdFileUpload
              className="icon"
              onClick={enviar}
              disabled={enviando}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3}>Carregando...</td>
                </tr>
              ) : exames.length === 0 ? (
                <tr>
                  <td colSpan={3}>Nenhum exame enviado.</td>
                </tr>
              ) : (
                exames.map((exame) => (
                  <tr key={exame.id}>
                    <td>{exame.tipo || "—"}</td>
                    <td>{formatarData(exame.created_at || exame.createdAt)}</td>
                    <td>
                      <MdFileDownload
                        onClick={() => baixar(exame)}
                        className="icon"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}