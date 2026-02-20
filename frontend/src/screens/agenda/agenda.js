import "./agenda.css";
import { Header } from "../../components/header/header";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { socket } from "../../services/socket";
import { Input } from "../../components/input/input";
import { Select } from "../../components/select/select";
import { IoSearch } from "react-icons/io5";

export function Agenda() {

  const [dataBase, setDataBase] = useState(() => {
    const hoje = new Date();
    return formatarISO(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  });

  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [cadastrar, setCadastrar] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalPacienteAberto, setModalPacienteAberto] = useState(false);
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [pacientesModal, setPacientesModal] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);


  const [form, setForm] = useState({
    paciente_id: "",
    profissional_id: "",
    tipo: "",
    status: "Agendado",
    data: dataBase,
    hora: "",
    local: "",
    observacao: ""
  });

  useEffect(() => {
    async function carregarProfissionais() {
      try {
        const response = await api.get("/profissionais");

        setProfissionais(response.data);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarAgendamentos();
    carregarProfissionais();
  }, [dataBase]);

  useEffect(() => {
    if (!modalPacienteAberto) return;

    const delay = setTimeout(async () => {
      try {
        const response = await api.get("/pacientes", {
          params: { nome: buscaPaciente }
        });

        setPacientesModal(response.data);
      } catch {
        toast.error("Erro ao buscar pacientes");
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [buscaPaciente, modalPacienteAberto]);


  useEffect(() => {
    socket.on("agendamento:created", ({ data }) => {
      if (estaNos5Dias(data.data)) {
        setAgendamentos(prev => [...prev, data]);
      }
    });

    socket.on("agendamento:updated", ({ id, data }) => {
      setAgendamentos(prev =>
        prev.map(a => (a.id === id ? data : a))
      );
    });

    socket.on("agendamento:deleted", ({ id }) => {
      setAgendamentos(prev =>
        prev.filter(a => a.id !== id)
      );
    });

    return () => {
      socket.off("agendamento:created");
      socket.off("agendamento:updated");
      socket.off("agendamento:deleted");
    };
  }, [dataBase]);

  useEffect(() => {
    async function carregarDisponiveis() {
      if (!form.profissional_id || !form.data) {
        setHorariosDisponiveis([]);
        return;
      }

      try {
        if (!editandoId) {
          setForm(prev => ({
            ...prev,
            hora: ''
          }));
        }

        const response = await api.get("/agendamentos-disponiveis", {
          params: {
            profissional_id: form.profissional_id,
            data: form.data
          }
        });

        setHorariosDisponiveis(response.data);
      } catch {
        setHorariosDisponiveis([]);
      }
    }

    carregarDisponiveis();
  }, [form.profissional_id, form.data]);

  function formatarISO(date) {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  function stringParaDate(dataString) {
    const [ano, mes, dia] = dataString.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  function gerar5Dias() {
    const dias = [];
    const base = stringParaDate(dataBase);

    for (let i = 0; i < 5; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      dias.push(formatarISO(d));
    }

    return dias;
  }

  function estaNos5Dias(data) {
    return gerar5Dias().includes(data);
  }

  async function carregarAgendamentos() {
    try {
      const dias = gerar5Dias();

      const requests = dias.map(d =>
        api.get("/agendamentos", { params: { data: d } })
      );

      const responses = await Promise.all(requests);
      const todos = responses.flatMap(r => r.data);

      setAgendamentos(todos);
    } catch {
      toast.error("Erro ao carregar agendamentos");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editandoId) {
        await api.put(`/agendamentos/${editandoId}`, form);
        toast.success("Agendamento atualizado");
      } else {
        await api.post("/agendamentos", form);
        toast.success("Agendamento criado");
      }

      resetForm();
      carregarAgendamentos();

    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao salvar");
    }
  }

  function handleEditar(ag) {
    setForm({
      paciente_id: ag.paciente_id,
      profissional_id: ag.profissional_id,
      tipo: ag.tipo,
      status: ag.status,
      data: ag.data,
      hora: ag.hora.slice(0, 5),
      local: ag.local || "",
      observacao: ag.observacao || ""
    });

    setPacienteSelecionado(ag.paciente);

    setEditandoId(ag.id);
    setCadastrar(true);
  }


  function resetForm() {
    setForm({
      paciente_id: "",
      profissional_id: "",
      tipo: "",
      status: "Agendado",
      data: dataBase,
      hora: "",
      local: "",
      observacao: ""
    });

    setPacienteSelecionado(null);
    setCadastrar(false);
    setEditandoId(null);
  }


  function avancarDia() {
    const atual = stringParaDate(dataBase);
    const nova = new Date(atual.getFullYear(), atual.getMonth(), atual.getDate() + 1);
    setDataBase(formatarISO(nova));
  }

  function voltarDia() {
    const atual = stringParaDate(dataBase);
    const nova = new Date(atual.getFullYear(), atual.getMonth(), atual.getDate() - 1);
    setDataBase(formatarISO(nova));
  }

  function formatarData(data) {
    return stringParaDate(data).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit"
    });
  }

  const dias = gerar5Dias();

  return (
    <>
      <Header nome="Agenda" />

      <div className="agenda">
        <div className="container">

          {cadastrar ? (
            <form className="card" onSubmit={handleSubmit}>

              <div className="row">
                <Select
                  label="Profissional"
                  value={form.profissional_id}
                  onChange={(value) =>
                    setForm(prev => ({
                      ...prev,
                      profissional_id: Number(value)
                    }))
                  }
                  options={[
                    { value: "", label: "Selecione um profissional" },
                    ...profissionais.map(p => ({
                      value: p.id,
                      label: p.nome
                    }))
                  ]}
                />
                <Input type="date" name="data" label="Data" value={form.data} onChange={handleChange} required disabled={!form.profissional_id} />
              </div>


              <div className="horarios-disponiveis">
                <h4>Horários disponíveis</h4>
                {
                  horariosDisponiveis.length > 0 ?
                    <div className="grid-horarios">
                      {horariosDisponiveis.map(h => (
                        <div
                          key={h}
                          className={`card-horario ${form.hora === h ? "selected" : ""}`}
                          onClick={() =>
                            setForm(prev => ({
                              ...prev,
                              hora: h
                            }))
                          }
                        >
                          {h}
                        </div>
                      ))}
                    </div>
                    :
                    <small>Não há horários disponíveis para essa data.</small>
                }
              </div>



              <div className="row">
                <Input
                  label="Paciente"
                  value={pacienteSelecionado?.nome || ""}
                  disabled
                  required
                  icon={<IoSearch className="icon" onClick={() => setModalPacienteAberto(true)} />}
                />

                <Select
                  label="Tipo"
                  value={form.tipo}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      tipo: value,
                    }))
                  }
                  options={[
                    { value: '', label: 'Selecione um tipo' },
                    { value: 'Consulta', label: 'Consulta' },
                    { value: 'Exame', label: 'Exame' },
                  ]}
                />
              </div>

              <div className="row">
                <Input name="local" label="Local" value={form.local} onChange={handleChange} />
                <Input name="observacao" label="Observação" value={form.observacao} onChange={handleChange} />
              </div>

              <div className="row">
                <button disabled={!form.hora}>{editandoId ? "Atualizar" : "Salvar"}</button>

                <button type="button" className="cancel" onClick={resetForm}>
                  Cancelar
                </button>
              </div>

            </form>
          ) : (
            <button onClick={() => setCadastrar(true)}>
              Novo Agendamento
            </button>
          )}

          <div className="board">
            <button onClick={voltarDia}>◀</button>

            {dias.map(dia => (
              <div key={dia} className="dia">

                <h3>{formatarData(dia)}</h3>

                {

                  agendamentos
                    .filter(a => a.data === dia).length > 0 ?
                    agendamentos
                      .filter(a => a.data === dia)
                      .map(ag => (
                        <div
                          key={ag.id}
                          className="card"
                          onClick={() => handleEditar(ag)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="conteudo">
                            <p>Horário:</p>
                            <small>{ag.hora.slice(0, 5)}</small>
                          </div>
                          <div className="conteudo">
                            <p>Paciente:</p>
                            <small>{ag.paciente?.nome}</small>
                          </div>
                          <div className="conteudo">
                            <p>Profissional:</p>
                            <small>{ag.profissional?.nome}</small>
                          </div>
                          <div className="conteudo">
                            <p>Tipo:</p>
                            <small>{ag.tipo}</small>
                          </div>
                          <div className="conteudo">
                            <p>Status:</p>
                            <small>{ag.status}</small>
                          </div>
                        </div>
                      ))
                    :
                    <small>Sem agendamentos.</small>
                }
              </div>
            ))}

            <button onClick={avancarDia}>▶</button>
          </div>

        </div>
      </div>
      {modalPacienteAberto && (
        <div className="modal-overlay" onClick={() => setModalPacienteAberto(false)}>
          <div className="modal-select" onClick={(e) => e.stopPropagation()}>
            <h3>Selecionar paciente</h3>

            <input
              type="text"
              placeholder="Pesquisar pelo nome..."
              value={buscaPaciente}
              onChange={(e) => setBuscaPaciente(e.target.value)}
            />

            <div className="list">
              {pacientesModal.map((paciente) => (
                <div
                  key={paciente.id}
                  className="item"
                  onClick={() => setPacienteSelecionado(paciente)}
                  id={pacienteSelecionado?.id === paciente.id ? "ativo" : ""}
                  style={{ cursor: "pointer" }}
                >
                  {paciente.nome}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setModalPacienteAberto(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!pacienteSelecionado) return;

                  setForm(prev => ({
                    ...prev,
                    paciente_id: pacienteSelecionado.id
                  }));

                  setModalPacienteAberto(false);
                }}
                disabled={!pacienteSelecionado}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
