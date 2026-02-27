import "./paciente.css";
import { Header } from "../../components/header/header";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { Input } from "../../components/input/input";
import { Select } from "../../components/select/select";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdFileDownload } from "react-icons/md";
import { Modal } from "../../components/modal/modal";

export function Paciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = id !== "novo";
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(isEdicao);
  const [salvando, setSalvando] = useState(false);

  const [vinculoAtual, setVinculoAtual] = useState(null);
  const [dietaAtiva, setDietaAtiva] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [buscaModal, setBuscaModal] = useState("");
  const [dietasModal, setDietasModal] = useState([]);
  const [dietaSelecionada, setDietaSelecionada] = useState(null);

  const [evolucoes, setEvolucoes] = useState([]);
  const [carregandoEvolucoes, setCarregandoEvolucoes] = useState(false);
  const [salvandoEvolucao, setSalvandoEvolucao] = useState(false);
  const [evolucaoForm, setEvolucaoForm] = useState({
    peso: "",
    massa_muscular: "",
    massa_gordura: "",
    percentual_gordura: "",
    imc: "",
    bioimpedancia_pdf: null,
  });

  const [evolucaoAbertaId, setEvolucaoAbertaId] = useState(null);
  const [exames, setExames] = useState([]);
  const [carregandoExames, setCarregandoExames] = useState(false);
  const [exameAbertoId, setExameAbertoId] = useState(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  async function handleExcluir() {
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("Paciente excluído com sucesso");
      navigate("/pacientes");
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao excluir paciente");
    }
  }

  async function carregarExames() {
    if (!isEdicao) return;

    try {
      setCarregandoExames(true);
      const response = await api.get(`/exames`, { params: { paciente_id: id } });
      setExames(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error("Erro ao carregar exames");
      setExames([]);
    } finally {
      setCarregandoExames(false);
    }
  }

  function toggleExame(exameId) {
    setExameAbertoId((prev) => (prev === exameId ? null : exameId));
  }

  async function abrirExameArquivo(exame) {
    try {
      const response = await api.get(`/exames/${exame.id}/arquivo`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(response.data);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      toast.error("Erro ao abrir arquivo do exame");
    }
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        if (isEdicao) {
          const response = await api.get(`/usuarios/${id}`);
          const data = response.data;

          setForm({
            ...data,
            data_nascimento: formatarDataISO(data.data_nascimento)
          });

          const vinculos = await api.get(
            `/dietas-usuarios?paciente_id=${id}`
          );

          if (vinculos.data.length > 0) {
            const vinculo = vinculos.data[0];
            setVinculoAtual(vinculo);
            setDietaAtiva(vinculo.dieta);
          }

          await carregarEvolucoes();
          await carregarExames();
        }
      } catch {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [id, isEdicao]);

  async function carregarEvolucoes() {
    if (!isEdicao) return;

    try {
      setCarregandoEvolucoes(true);
      const response = await api.get(`/evolucoes?paciente_id=${id}`);
      setEvolucoes(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error("Erro ao carregar evoluções");
    } finally {
      setCarregandoEvolucoes(false);
    }
  }

  useEffect(() => {
    if (!modalAberto) return;

    const delay = setTimeout(async () => {
      try {
        const response = await api.get(`/dietas?titulo=${buscaModal}`);
        setDietasModal(response.data);
      } catch {
        toast.error("Erro ao buscar dietas");
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [buscaModal, modalAberto]);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    data_nascimento: "",
    sexo: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    foto: "",
    tipo: "paciente",
    fase_metodo_ascend: ""
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function formatarData(value) {
    value = value.replace(/\D/g, "");
    value = value.slice(0, 8);

    if (value.length <= 2) return value;
    if (value.length <= 4) return `${value.slice(0, 2)}/${value.slice(2)}`;
    return `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
  }

  function formatarDataISO(dataISO) {
    if (!dataISO) return "";

    const data = new Date(dataISO);

    const dia = String(data.getUTCDate()).padStart(2, "0");
    const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
    const ano = data.getUTCFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  function handleDataNascimento(e) {
    const formatted = formatarData(e.target.value);

    setForm(prev => ({
      ...prev,
      data_nascimento: formatted
    }));
  }

  async function salvarVinculo() {
    if (!isEdicao) {
      toast.error("Salve o paciente antes de vincular uma dieta");
      return;
    }

    if (!dietaSelecionada) {
      toast.error("Selecione uma dieta");
      return;
    }

    try {
      if (!vinculoAtual) {
        const response = await api.post("/dietas-usuarios", {
          paciente_id: id,
          dieta_id: dietaSelecionada.id
        });
        setVinculoAtual(response.data);
      } else {
        await api.put(`/dietas-usuarios/${vinculoAtual.id}`, {
          dieta_id: dietaSelecionada.id
        });
      }

      setDietaAtiva(dietaSelecionada);
      toast.success("Dieta atualizada");
      setModalAberto(false);
      setDietaSelecionada(null);
    } catch {
      toast.error("Erro ao vincular dieta");
    }
  }

  function converterParaISO(dataBR) {
    if (!dataBR) return null;

    const [dia, mes, ano] = dataBR.split("/");

    if (!dia || !mes || !ano) return null;

    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 11);

    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }

    setForm((prev) => ({
      ...prev,
      cpf: value,
    }));
  };

  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 11);

    if (value.length > 10) {
      value = value.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
    } else if (value.length > 6) {
      value = value.replace(/(\d{2})(\d{4,5})(\d{1,4})/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{1,5})/, "($1) $2");
    } else if (value.length > 0) {
      value = value.replace(/(\d*)/, "($1");
    }

    setForm((prev) => ({
      ...prev,
      telefone: value,
    }));
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 8);

    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    }

    setForm((prev) => ({
      ...prev,
      cep: value,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if(form.fase_metodo_ascend === ""){
        toast.info("Selecione a fase do Método Ascend");
        return
      }

      setSalvando(true);

      const payload = {
        ...form,
        data_nascimento: converterParaISO(form.data_nascimento)
      };

      if (isEdicao) {
        await api.put(`/usuarios/${id}`, payload);
        toast.success("Paciente atualizado");
      } else {
        await api.post(`/pacientes`, payload);
        toast.success("Paciente cadastrado");
        navigate('/pacientes')
      }
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  function handleEvolucaoChange(e) {
    const { name, value } = e.target;
    setEvolucaoForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleEvolucaoFile(e) {
    const file = e.target.files?.[0] || null;
    setEvolucaoForm(prev => ({
      ...prev,
      bioimpedancia_pdf: file
    }));
  }

  async function salvarEvolucao() {
    if (!isEdicao) return;

    try {
      setSalvandoEvolucao(true);

      const formData = new FormData();
      formData.append("paciente_id", String(id));
      formData.append("peso", evolucaoForm.peso);
      formData.append("massa_muscular", evolucaoForm.massa_muscular);
      formData.append("massa_gordura", evolucaoForm.massa_gordura);
      formData.append("percentual_gordura", evolucaoForm.percentual_gordura);
      formData.append("imc", evolucaoForm.imc);

      if (evolucaoForm.bioimpedancia_pdf) {
        formData.append("bioimpedancia_pdf", evolucaoForm.bioimpedancia_pdf);
      }

      await api.post("/evolucoes", formData);

      toast.success("Evolução cadastrada");

      setEvolucaoForm({
        peso: "",
        massa_muscular: "",
        massa_gordura: "",
        percentual_gordura: "",
        imc: "",
        bioimpedancia_pdf: null,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await carregarEvolucoes();
    } catch {
      toast.error("Erro ao salvar evolução");
    } finally {
      setSalvandoEvolucao(false);
    }
  }

  function formatarDataHora(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  }

  function toggleEvolucao(id) {
    setEvolucaoAbertaId(prev => (prev === id ? null : id));
  }

  async function abrirBioimpedancia(ev) {
    try {
      const response = await api.get(`/evolucoes/${ev.id}/pdf`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(response.data);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      toast.error("Erro ao abrir PDF");
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <>
      <Header nome={isEdicao ? "Editar Paciente" : "Novo Paciente"} />

      <div className="paciente">
        <form className="card" onSubmit={handleSubmit}>
          <div className="grid">
            <h4>Dados</h4>

            <div className="row">
              <Input label="Nome" placeholder="Nome" name="nome" value={form.nome} onChange={handleChange} required />
              <Input label="Email" placeholder="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="row">
              <Input label="CPF" placeholder="CPF" name="cpf" value={form.cpf} onChange={handleCpfChange} />
              <Input
                label="Data de nascimento"
                placeholder="DD/MM/AAAA"
                name="data_nascimento"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={form.data_nascimento || ""}
                onChange={handleDataNascimento}
              />
              <Select
                label="Sexo"
                value={form.sexo}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    sexo: value,
                  }))
                }
                options={[
                  { value: '', label: 'Selecione um sexo' },
                  { value: 'Masculino', label: 'Masculino' },
                  { value: 'Feminino', label: 'Feminino' },
                ]}
              />
            </div>

            <div className="row">
              <Select
                label="Fase do Método Ascend"
                value={form.fase_metodo_ascend}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    fase_metodo_ascend: value,
                  }))
                }
                options={[
                  { value: '', label: 'Selecione uma fase' },
                  { value: 1, label: 'Fase 1' },
                  { value: 2, label: 'Fase 2' },
                  { value: 3, label: 'Fase 3' },
                ]}
                required
              />
              <Input label="Telefone" placeholder="Telefone" name="telefone" value={form.telefone} onChange={handleTelefoneChange} />
              <Input label="CEP" placeholder="CEP" name="cep" value={form.cep} onChange={handleCepChange} />
            </div>

            <div className="row">
              <Input label="Rua" placeholder="Rua" name="rua" value={form.rua} onChange={handleChange} />
              <Input label="Número" placeholder="Número" name="numero" value={form.numero} onChange={handleChange} />
              <Input label="Complemento" placeholder="Complemento" name="complemento" value={form.complemento} onChange={handleChange} />
            </div>

            <div className="row">
              <Input label="Bairro" placeholder="Bairro" name="bairro" value={form.bairro} onChange={handleChange} />
              <Input label="Cidade" placeholder="Cidade" name="cidade" value={form.cidade} onChange={handleChange} />
              <Input label="Estado" placeholder="Estado" name="estado" value={form.estado} onChange={handleChange} />
            </div>

            <div className="row">
              <button type="button" className="cancel" disabled={salvando} onClick={() => navigate('/pacientes')}>
                Voltar
              </button>
              <button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : isEdicao ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
            {isEdicao && (
              <button
                type="button"
                className="delete"
                disabled={salvando}
                onClick={() => setConfirmarExclusao(true)}
              >
                Excluir
              </button>
            )}

            {isEdicao && (
              <>
                <div className="divisor-horizontal" />

                <h4>Dieta ativa</h4>

                {dietaAtiva ? (
                  <div className="dieta-box">
                    <h4>{dietaAtiva.titulo}</h4>

                    <div className="row">
                      {dietaAtiva.refeicoes?.map((ref, index) => (
                        <div key={index} className="refeicao-dropdown-item">
                          <strong>{ref.horario} - {ref.refeicao}</strong>
                          <small>{ref.descricao}</small>
                        </div>
                      ))}
                    </div>

                    <button type="button" onClick={() => setModalAberto(true)}>
                      Alterar dieta
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setModalAberto(true)}>
                    Vincular dieta
                  </button>
                )}

                <div className="divisor-horizontal" />
                <h4>Evolução</h4>

                <div className="evolucao-form">
                  <div className="row">
                    <Input label="Peso" placeholder="0,00" name="peso" value={evolucaoForm.peso} onChange={handleEvolucaoChange} />
                    <Input label="Massa muscular" placeholder="0,00" name="massa_muscular" value={evolucaoForm.massa_muscular} onChange={handleEvolucaoChange} />
                    <Input label="Massa gordura" placeholder="0,00" name="massa_gordura" value={evolucaoForm.massa_gordura} onChange={handleEvolucaoChange} />
                    <Input label="% gordura" placeholder="0,00" name="percentual_gordura" value={evolucaoForm.percentual_gordura} onChange={handleEvolucaoChange} />
                    <Input label="IMC" placeholder="0,00" name="imc" value={evolucaoForm.imc} onChange={handleEvolucaoChange} />
                  </div>
                  <div className="input-container">
                    <label>PDF Bioimpedância:</label>
                    <input type="file" ref={fileInputRef} accept="application/pdf" onChange={handleEvolucaoFile} />
                  </div>

                  <button
                    type="button"
                    onClick={salvarEvolucao}
                    disabled={salvandoEvolucao}
                  >
                    {salvandoEvolucao ? "Salvando..." : "Cadastrar evolução"}
                  </button>
                </div>

                <div className="evolucoes-list">
                  <h4>Evolucões</h4>
                  {carregandoEvolucoes ? (
                    <p>Carregando evoluções...</p>
                  ) : evolucoes.length === 0 ? (
                    <p>Nenhuma evolução cadastrada.</p>
                  ) : (
                    evolucoes.map((ev) => (
                      <div
                        key={ev.id}
                        className="evolucao-item"
                        onClick={() => toggleEvolucao(ev.id)}
                        aria-expanded={evolucaoAbertaId === ev.id}
                      >
                        <div className="topo">
                          <p>Evolução - {formatarDataHora(ev.created_at || ev.createdAt)}</p>
                          {evolucaoAbertaId === ev.id ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </div>
                        {evolucaoAbertaId === ev.id && (
                          <div className="evolucao-detalhes">
                            <p>Peso: {ev.peso}kg</p>
                            <p>Massa muscular: {ev.massa_muscular}kg</p>
                            <p>Massa gordura: {ev.massa_gordura}kg</p>
                            <p>PGC: {ev.percentual_gordura}%</p>
                            <p>IMC: {ev.imc}kg/m²</p>
                            {ev.bioimpedancia_url && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirBioimpedancia(ev);
                                }}
                              >
                                Ver PDF da bioimpedância
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="divisor-horizontal" />
                <h4>Exames</h4>
                <div className="evolucoes-list">
                  {carregandoExames ? (
                    <p>Carregando exames...</p>
                  ) : exames.length === 0 ? (
                    <p>Nenhum exame cadastrado.</p>
                  ) : (
                    exames.map((ex) => (
                      <div
                        key={ex.id}
                        className="evolucao-item"
                        onClick={() => toggleExame(ex.id)}
                        aria-expanded={exameAbertoId === ex.id}
                      >
                        <div className="topo">
                          <p>{ex.tipo || "Exame"} - {formatarDataHora(ex.created_at || ex.createdAt)}</p>
                          {exameAbertoId === ex.id ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </div>

                        {exameAbertoId === ex.id && (
                          <div className="evolucao-detalhes">
                            <p>Tipo: {ex.tipo}</p>
                            <p>Arquivo: {ex.nome_original || "—"}</p>

                            {ex.url ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirExameArquivo(ex);
                                }}
                              >
                                Visualizar arquivo
                              </button>
                            ) : (
                              <p>Sem arquivo</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </form>

        {modalAberto && (
          <div className="modal-overlay" onClick={() => setModalAberto(false)}>
            <div className="modal-select" onClick={(e) => e.stopPropagation()}>
              <h3>Selecionar dieta</h3>

              <input
                type="text"
                placeholder="Pesquisar pelo título..."
                value={buscaModal}
                onChange={(e) => setBuscaModal(e.target.value)}
              />

              <div className="list">
                {dietasModal.map((dieta) => (
                  <div
                    key={dieta.id}
                    className="item"
                    onClick={() => setDietaSelecionada(dieta)}
                    id={dietaSelecionada?.id === dieta.id ? "ativo" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    {dieta.titulo}
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel" onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>

                <button type="button" onClick={salvarVinculo} disabled={!dietaSelecionada}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {confirmarExclusao && (
        <Modal
          isOpen={confirmarExclusao}
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir este paciente?"
          cancelText="Cancelar"
          confirmText="Excluir"
          onCancel={() => setConfirmarExclusao(false)}
          onConfirm={async () => {
            await handleExcluir();
            setConfirmarExclusao(false);
          }}
        />
      )}
    </>
  );
}