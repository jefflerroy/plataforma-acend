import "./dietas.css";
import { Header } from "../../components/header/header";
import { MdDelete } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { Modal } from "../../components/modal/modal";
import { Input } from "../../components/input/input";
import { TextArea } from "../../components/textarea/textarea";

export function Dietas() {
  const [dietas, setDietas] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [cadastrar, setCadastrar] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [dietaParaExcluir, setDietaParaExcluir] = useState(null);

  const [importandoPdf, setImportandoPdf] = useState(false);
  const fileRef = useRef(null);

  const refeicaoVazia = {
    horario: "",
    refeicao: "",
    descricao: ""
  };

  const [form, setForm] = useState({
    titulo: "",
    observacao: "",
    refeicoes: []
  });

  async function carregarDietas() {
    try {
      const response = await api.get("/dietas");
      setDietas(response.data);
    } catch {
      toast.error("Erro ao carregar dietas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDietas();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function adicionarRefeicao() {
    setForm((prev) => ({
      ...prev,
      refeicoes: [...prev.refeicoes, { ...refeicaoVazia }]
    }));
  }

  function removerRefeicao(index) {
    setForm((prev) => ({
      ...prev,
      refeicoes: prev.refeicoes.filter((_, i) => i !== index)
    }));
  }

  function handleRefeicaoChange(index, campo, valor) {
    setForm((prev) => {
      const novas = [...prev.refeicoes];
      novas[index] = { ...novas[index], [campo]: valor };
      return { ...prev, refeicoes: novas };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      titulo: form.titulo,
      observacao: form.observacao,
      refeicoes: (form.refeicoes || []).map((r) => ({
        horario: r.horario,
        refeicao: r.refeicao,
        descricao: r.descricao
      }))
    };

    try {
      if (editandoId) {
        await api.put(`/dietas/${editandoId}`, payload);
        toast.success("Dieta atualizada com sucesso");
      } else {
        await api.post("/dietas", payload);
        toast.success("Dieta cadastrada com sucesso");
      }

      setForm({ titulo: "", observacao: "", refeicoes: [] });
      setCadastrar(false);
      setEditandoId(null);
      carregarDietas();
    } catch {
      toast.error("Erro ao salvar dieta");
    }
  }

  async function handleExcluir(id) {
    try {
      await api.delete(`/dietas/${id}`);
      toast.success("Dieta excluída com sucesso");
      carregarDietas();
    } catch {
      toast.error("Erro ao excluir dieta");
    }
  }

  function toggleExpand(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function handleEditar(dieta) {
    setForm({
      titulo: dieta.titulo || "",
      observacao: dieta.observacao || "",
      refeicoes: (dieta.refeicoes || []).map((r) => ({
        id: r.id,
        horario: r.horario || "",
        refeicao: r.refeicao || "",
        descricao: r.descricao || ""
      }))
    });

    setEditandoId(dieta.id);
    setCadastrar(true);
    setExpanded(null);
  }

  function abrirSeletorPdf(e) {
    e.preventDefault();
    fileRef.current?.click();
  }

  async function importarPdf(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Envie um arquivo PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setImportandoPdf(true);

    try {
      const response = await api.post("/dietas/parse-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const data = response.data || {};

      setForm({
        titulo: data.titulo || "",
        observacao: data.observacao || "",
        refeicoes: Array.isArray(data.refeicoes)
          ? data.refeicoes.map((r) => ({
            horario: r.horario || "",
            refeicao: r.refeicao || "",
            descricao: r.descricao || ""
          }))
          : []
      });

      toast.success("PDF importado. Revise os campos e salve.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao importar PDF");
    } finally {
      setImportandoPdf(false);
    }
  }

  const dietasFiltradas = dietas.filter((d) =>
    (d.titulo || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      <Header nome="Dietas" />

      <div className="dietas">
        <div className="lista">
          {cadastrar ? (
            <form className="card" onSubmit={handleSubmit}>
              <div className="row" style={{ gap: 10, marginBottom: 10 }}>
                <button onClick={abrirSeletorPdf} disabled={importandoPdf} type="button">
                  {importandoPdf ? "Importando..." : "Importar PDF"}
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={importarPdf}
                />

                <button
                  type="button"
                  className="cancel"
                  disabled={importandoPdf}
                  onClick={() => {
                    setForm({ titulo: "", observacao: "", refeicoes: [] });
                    setEditandoId(null);
                  }}
                >
                  Limpar
                </button>
              </div>

              <div className="column">
                <Input
                  label="Titulo"
                  placeholder="Titulo"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                />

                <TextArea
                  label="Observações"
                  placeholder="Observações"
                  name="observacao"
                  value={form.observacao}
                  onChange={handleChange}
                />
              </div>

              <div className="refeicoes">
                <h3>Refeições</h3>

                {form.refeicoes.map((refeicao, index) => (
                  <div key={index} className="refeicao-item">
                    <div className="row">
                      <Input
                        label="Horário"
                        placeholder="HH:MM"
                        value={refeicao.horario || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                          let formatted = value;

                          if (value.length >= 3) {
                            formatted = `${value.slice(0, 2)}:${value.slice(2)}`;
                          }

                          handleRefeicaoChange(index, "horario", formatted);
                        }}
                      />

                      <Input
                        label="Refeição"
                        placeholder="Refeição"
                        value={refeicao.refeicao || ""}
                        onChange={(e) => handleRefeicaoChange(index, "refeicao", e.target.value)}
                      />
                    </div>

                    <TextArea
                      label="Descrição"
                      placeholder="Descrição"
                      value={refeicao.descricao || ""}
                      onChange={(e) => handleRefeicaoChange(index, "descricao", e.target.value)}
                    />

                    <button
                      className="cancel"
                      onClick={(e) => {
                        e.preventDefault();
                        removerRefeicao(index);
                      }}
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  adicionarRefeicao();
                }}
              >
                Adicionar Refeição
              </button>

              <div className="row">
                <button disabled={importandoPdf}>
                  {editandoId ? "Atualizar Dieta" : "Salvar Dieta"}
                </button>

                <button
                  className="cancel"
                  disabled={importandoPdf}
                  onClick={(e) => {
                    e.preventDefault();
                    setCadastrar(false);
                    setEditandoId(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setCadastrar(true)}>Cadastrar Dieta</button>
          )}

          <input
            placeholder="Pesquisar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Qtd. Refeições</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dietasFiltradas.map((dieta) => (
                  <>
                    <tr
                      key={dieta.id}
                      onClick={() => toggleExpand(dieta.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{dieta.titulo}</td>
                      <td>{dieta.refeicoes?.length || 0}</td>
                      <td>{expanded === dieta.id ? <IoIosArrowUp /> : <IoIosArrowDown />}</td>
                    </tr>

                    {expanded === dieta.id && (
                      <tr>
                        <td colSpan="3">
                          <div className="dropdown-refeicoes">
                            {dieta.observacao ? (
                              <div style={{ marginBottom: 10, whiteSpace: "pre-wrap" }}>
                                {dieta.observacao}
                              </div>
                            ) : null}

                            <div className="row">
                              {dieta.refeicoes?.map((ref, index) => (
                                <div key={index} className="refeicao-dropdown-item">
                                  <strong>
                                    {ref.horario} - {ref.refeicao}
                                  </strong>

                                  {ref.descricao ? (
                                    <small style={{ whiteSpace: "pre-wrap" }}>{ref.descricao}</small>
                                  ) : null}
                                </div>
                              ))}
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditar(dieta);
                                }}
                              >
                                Editar
                              </button>

                              <button
                                className="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDietaParaExcluir(dieta.id);
                                  setConfirmarExclusao(true);
                                }}
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {confirmarExclusao && (
        <Modal
          isOpen={confirmarExclusao}
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir esta dieta?"
          cancelText="Cancelar"
          confirmText="Excluir"
          onCancel={() => {
            setConfirmarExclusao(false);
            setDietaParaExcluir(null);
          }}
          onConfirm={async () => {
            await handleExcluir(dietaParaExcluir);
            setConfirmarExclusao(false);
            setDietaParaExcluir(null);
          }}
        />
      )}
    </>
  );
}