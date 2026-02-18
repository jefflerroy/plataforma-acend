import "./dietas.css";
import { Header } from "../../components/header/header";
import { MdDelete } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { Modal } from "../../components/modal/modal";
import { Input } from "../../components/input/input";

export function Dietas() {
  const [dietas, setDietas] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [cadastrar, setCadastrar] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [dietaParaExcluir, setDietaParaExcluir] = useState(null);

  const refeicaoVazia = {
    horario: "",
    refeicao: "",
    descricao: "",
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0,
    calorias: 0
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
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function adicionarRefeicao() {
    setForm(prev => ({
      ...prev,
      refeicoes: [...prev.refeicoes, { ...refeicaoVazia }]
    }));
  }

  function removerRefeicao(index) {
    setForm(prev => ({
      ...prev,
      refeicoes: prev.refeicoes.filter((_, i) => i !== index)
    }));
  }

  function handleRefeicaoChange(index, campo, valor) {
    setForm(prev => {
      const novas = [...prev.refeicoes];
      novas[index] = { ...novas[index], [campo]: valor };
      return { ...prev, refeicoes: novas };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editandoId) {
        await api.put(`/dietas/${editandoId}`, form);
        toast.success("Dieta atualizada com sucesso");
      } else {
        await api.post("/dietas", form);
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
    setExpanded(prev => (prev === id ? null : id));
  }

  function handleEditar(dieta) {
    setForm({
      titulo: dieta.titulo,
      observacao: dieta.observacao,
      refeicoes: dieta.refeicoes || []
    });

    setEditandoId(dieta.id);
    setCadastrar(true);
    setExpanded(null);
  }

  const dietasFiltradas = dietas.filter(d =>
    d.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      <Header nome="Dietas" />

      <div className="dietas">
        <div className="lista">

          {cadastrar ? (
            <form className="card" onSubmit={handleSubmit}>
              <div className="row">
                <Input
                  label="Titulo"
                  placeholder="Titulo"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                />

                <Input
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
                        onChange={(e) =>
                          handleRefeicaoChange(index, "refeicao", e.target.value)
                        }
                      />
                    </div>

                    <Input
                      label="Descrição"
                      placeholder="Descrição"
                      value={refeicao.descricao || ""}
                      onChange={(e) =>
                        handleRefeicaoChange(index, "descricao", e.target.value)
                      }
                    />

                    <div className="row">
                      <Input
                        type="number"
                        label="Proteínas"
                        placeholder="Proteínas"
                        value={refeicao.proteinas || ""}
                        onChange={(e) =>
                          handleRefeicaoChange(index, "proteinas", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        label="Carboidratos"
                        placeholder="Carboidratos"
                        value={refeicao.carboidratos || ""}
                        onChange={(e) =>
                          handleRefeicaoChange(index, "carboidratos", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        label="Gorduras"
                        placeholder="Gorduras"
                        value={refeicao.gorduras || ""}
                        onChange={(e) =>
                          handleRefeicaoChange(index, "gorduras", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        label="Calorias"
                        placeholder="Calorias"
                        value={refeicao.calorias || ""}
                        onChange={(e) =>
                          handleRefeicaoChange(index, "calorias", e.target.value)
                        }
                      />
                    </div>

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
                <button>
                  {editandoId ? "Atualizar Dieta" : "Salvar Dieta"}
                </button>

                <button
                  className="cancel"
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
            <button onClick={() => setCadastrar(true)}>
              Cadastrar Dieta
            </button>
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
                      <td>
                        {expanded === dieta.id ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </td>
                    </tr>

                    {expanded === dieta.id && (
                      <tr>
                        <td colSpan="3">
                          <div className="dropdown-refeicoes">

                            <div className="row">
                              {dieta.refeicoes?.map((ref, index) => (
                                <div key={index} className="refeicao-dropdown-item">
                                  <strong>{ref.horario} - {ref.refeicao}</strong>
                                  <small>{ref.descricao}</small>
                                  <small>
                                    P: {ref.proteinas} | C: {ref.carboidratos} | G: {ref.gorduras} | Kcal: {ref.calorias}
                                  </small>
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
                                className="cancel"
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
