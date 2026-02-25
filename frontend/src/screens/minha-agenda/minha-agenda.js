import "./minha-agenda.css";
import { Header } from "../../components/header/header";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Select } from "../../components/select/select";
import { Input } from "../../components/input/input";
import { toast } from "react-toastify";
import { socket } from "../../services/socket";

export function MinhaAgenda() {
  const pacienteId = Number(localStorage.getItem("id"));

  const [agendamentos, setAgendamentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [cadastrar, setCadastrar] = useState(false);

  const [config, setConfig] = useState({
    bloquear_agendamentos: false,
    whatsapp_agendamentos: null,
  });

  const [form, setForm] = useState({
    profissional_id: "",
    tipo: "",
    data: "",
    hora: "",
    local: "",
    observacao: "",
  });

  useEffect(() => {
    carregarConfig();
    carregarAgendamentos();
    carregarProfissionais();
  }, []);

  useEffect(() => {
    carregarHorarios();
  }, [form.profissional_id, form.data]);

  useEffect(() => {
    const onConfigUpdated = (data) => {
      setConfig({
        bloquear_agendamentos: !!data.bloquear_agendamentos,
        whatsapp_agendamentos: data.whatsapp_agendamentos || null,
      });

      if (!!data.bloquear_agendamentos) {
        setCadastrar(false);
        setForm({
          profissional_id: "",
          tipo: "",
          data: "",
          hora: "",
          local: "",
          observacao: "",
        });
      }
    };

    const onAgendamentoCreated = (ag) => {
      if (Number(ag.paciente_id) !== pacienteId) return;
      setAgendamentos((prev) => [ag, ...prev]);
    };

    const onAgendamentoUpdated = (ag) => {
      if (Number(ag.paciente_id) !== pacienteId) return;
      setAgendamentos((prev) => prev.map((x) => (x.id === ag.id ? ag : x)));
    };

    const onAgendamentoDeleted = (payload) => {
      const id = payload?.id ?? payload;
      setAgendamentos((prev) => prev.filter((x) => x.id !== id));
    };

    socket.on("configuracoes:updated", onConfigUpdated);
    socket.on("agendamentos:created", onAgendamentoCreated);
    socket.on("agendamentos:updated", onAgendamentoUpdated);
    socket.on("agendamentos:deleted", onAgendamentoDeleted);

    return () => {
      socket.off("configuracoes:updated", onConfigUpdated);
      socket.off("agendamentos:created", onAgendamentoCreated);
      socket.off("agendamentos:updated", onAgendamentoUpdated);
      socket.off("agendamentos:deleted", onAgendamentoDeleted);
    };
  }, [pacienteId]);

  function formatarDataBR(data) {
    const date = new Date(data + "T00:00:00");
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  async function carregarConfig() {
    try {
      const { data } = await api.get("/configuracoes/paciente");
      setConfig({
        bloquear_agendamentos: !!data.bloquear_agendamentos,
        whatsapp_agendamentos: data.whatsapp_agendamentos || null,
      });
    } catch {
      setConfig({
        bloquear_agendamentos: false,
        whatsapp_agendamentos: null,
      });
    }
  }

  async function carregarAgendamentos() {
    try {
      const response = await api.get("/agendamentos", {
        params: { paciente_id: pacienteId },
      });
      setAgendamentos(response.data);
    } catch {
      console.error("Erro ao carregar agendamentos");
    }
  }

  async function carregarProfissionais() {
    try {
      const response = await api.get("/profissionais");
      setProfissionais(response.data);
    } catch {
      console.error("Erro ao carregar profissionais");
    }
  }

  async function carregarHorarios() {
    if (!form.profissional_id || !form.data) {
      setHorariosDisponiveis([]);
      return;
    }

    try {
      const response = await api.get("/agendamentos-disponiveis", {
        params: {
          profissional_id: form.profissional_id,
          data: form.data,
        },
      });

      setHorariosDisponiveis(response.data);
    } catch {
      setHorariosDisponiveis([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post("/agendamentos", {
        ...form,
        paciente_id: pacienteId,
        status: "Agendado",
      });

      toast.success("Agendamento criado com sucesso");
      setCadastrar(false);
      setForm({
        profissional_id: "",
        tipo: "",
        data: "",
        hora: "",
        local: "",
        observacao: "",
      });
      carregarAgendamentos();
    } catch {
      toast.error("Erro ao criar agendamento");
    }
  }

  function abrirWhatsApp(ag) {
    const numero = String(config.whatsapp_agendamentos || "").replace(/\D/g, "");
    if (!numero) {
      toast.error("WhatsApp para agendamentos não configurado");
      return;
    }

    const mensagem = `Olá, gostaria de reagendar minha consulta do dia ${formatarDataBR(
      ag.data
    )} às ${ag.hora.slice(0, 5)} com ${ag.profissional?.nome}.`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  }

  function formatarData(data) {
    const date = new Date(data + "T00:00:00");
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return {
      mes: meses[date.getMonth()],
      dia: date.getDate(),
    };
  }

  const futuros = agendamentos.filter((a) => a.status !== "Concluído");
  const historico = agendamentos.filter((a) => a.status === "Concluído");

  return (
    <>
      <Header nome="Minha Agenda" />

      <div className="minha-agenda">
        <div className="container">
          <div className="cabecalho">
            <div>
              <h2>Minha Agenda</h2>
              <p>Gerencie suas consultas e exames Ascend.</p>
            </div>

            {!config.bloquear_agendamentos && (
              <button onClick={() => setCadastrar(!cadastrar)}>
                Novo Agendamento
              </button>
            )}
          </div>

          {cadastrar && !config.bloquear_agendamentos && (
            <form className="novo-agendamento" onSubmit={handleSubmit}>
              <div className="row">
                <Select
                  label="Profissional"
                  value={form.profissional_id}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      profissional_id: Number(value),
                    }))
                  }
                  options={[
                    { value: "", label: "Selecione um profissional" },
                    ...profissionais.map((p) => ({
                      value: p.id,
                      label: p.nome,
                    })),
                  ]}
                />

                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  label="Data"
                  name="data"
                  value={form.data}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, data: e.target.value }))
                  }
                />
              </div>

              {horariosDisponiveis.length > 0 && (
                <div className="horarios-disponiveis">
                  {horariosDisponiveis.map((h) => (
                    <div
                      key={h}
                      className={`card-horario ${form.hora === h ? "selected" : ""
                        }`}
                      onClick={() => setForm((prev) => ({ ...prev, hora: h }))}
                    >
                      {h}
                    </div>
                  ))}
                </div>
              )}

              <div className="row">
                <Select
                  label="Tipo"
                  value={form.tipo}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, tipo: value }))
                  }
                  options={[
                    { value: "", label: "Selecione um tipo" },
                    { value: "Consulta", label: "Consulta" },
                    { value: "Exame", label: "Exame" },
                  ]}
                />

                <Input
                  label="Local"
                  name="local"
                  value={form.local}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, local: e.target.value }))
                  }
                />
              </div>

              <Input
                label="Observação"
                name="observacao"
                value={form.observacao}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, observacao: e.target.value }))
                }
              />

              <button disabled={!form.hora}>Salvar</button>
            </form>
          )}

          {futuros.map((ag) => {
            const { mes, dia } = formatarData(ag.data);

            return (
              <div className="agendamento" key={ag.id}>
                <div className="dados">
                  <div className="data">
                    <span className="mes">{mes}</span>
                    <span className="dia">{dia}</span>
                  </div>

                  <div className="info">
                    <div className="status">
                      <span>{ag.tipo}</span>
                      <span>{ag.status}</span>
                    </div>
                    <h3>{ag.profissional?.nome}</h3>
                    <div className="local">
                      <span>{ag.hora.slice(0, 5)}</span>
                      <span>{ag.local || "Clínica Ascend"}</span>
                    </div>
                  </div>
                </div>

                <div className="acoes">
                  <button onClick={() => abrirWhatsApp(ag)}>Reagendar</button>
                </div>
              </div>
            );
          })}

          {historico.length > 0 && (
            <div className="historico">
              <h4>Histórico</h4>
              {historico.map((ag) => (
                <p key={ag.id}>
                  {formatarDataBR(ag.data)} - {ag.tipo} com{" "}
                  {ag.profissional?.nome}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}