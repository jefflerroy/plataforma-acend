import "./usuario.css";
import { Header } from "../../components/header/header";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { socket } from "../../services/socket";
import { Input } from "../../components/input/input";
import { Select } from "../../components/select/select";
import { Modal } from "../../components/modal/modal";

export function Usuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = id !== "novo";

  const [loading, setLoading] = useState(isEdicao);
  const [salvando, setSalvando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);

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
    tipo: ""
  });

  const [horarios, setHorarios] = useState([]);
  const [novoHorario, setNovoHorario] = useState({
    id: null,
    dia_semana: '',
    hora_inicio: '',
    intervalo_inicio: '',
    intervalo_fim: '',
    hora_fim: '',
    intervalo_atendimento: '',
    ativo: true
  });

  const [bloqueios, setBloqueios] = useState([]);
  const [novoBloqueio, setNovoBloqueio] = useState({
    id: null,
    data_inicio: '',
    data_fim: '',
    motivo: ''
  });


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

          if (data.tipo === 'medico') {
            const responseHorarios = await api.get(`/horarios/${id}`);
            setHorarios(responseHorarios.data);

            const responseBloqueios = await api.get(`/bloqueios`);
            const filtrados = responseBloqueios.data.filter(b => String(b.usuario_id) === String(id));
            setBloqueios(filtrados);
          }

        }
      } catch {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [id, isEdicao]);

  useEffect(() => {
    function onCreated(data) {
      if (String(data.data.usuario_id) !== String(id)) return;

      setHorarios(prev => {
        const index = prev.findIndex(h => h.id === data.id);

        if (index !== -1) {
          const atualizados = [...prev];
          atualizados[index] = data.data;
          return atualizados;
        }

        return [...prev, data.data];
      });
    }

    function onUpdated(data) {
      if (String(data.data.usuario_id) !== String(id)) return;

      setHorarios(prev =>
        prev.map(h => h.id === data.id ? data.data : h)
      );
    }

    function onDeleted(data) {
      setHorarios(prev =>
        prev.filter(h => h.id !== data.id)
      );
    }

    function onBloqueioCreated(data) {
      if (String(data.data.usuario_id) !== String(id)) return;

      setBloqueios(prev => {
        const index = prev.findIndex(b => b.id === data.id);
        if (index !== -1) {
          const atualizados = [...prev];
          atualizados[index] = data.data;
          return atualizados;
        }
        return [...prev, data.data];
      });
    }

    function onBloqueioUpdated(data) {
      if (String(data.data.usuario_id) !== String(id)) return;

      setBloqueios(prev =>
        prev.map(b => b.id === data.id ? data.data : b)
      );
    }

    function onBloqueioDeleted(data) {
      setBloqueios(prev =>
        prev.filter(b => b.id !== data.id)
      );
    }

    socket.on("horario:created", onCreated);
    socket.on("horario:updated", onUpdated);
    socket.on("horario:deleted", onDeleted);
    socket.on("bloqueio:created", onBloqueioCreated);
    socket.on("bloqueio:updated", onBloqueioUpdated);
    socket.on("bloqueio:deleted", onBloqueioDeleted);


    return () => {
      socket.off("horario:created", onCreated);
      socket.off("horario:updated", onUpdated);
      socket.off("horario:deleted", onDeleted);
      socket.off("bloqueio:created", onBloqueioCreated);
      socket.off("bloqueio:updated", onBloqueioUpdated);
      socket.off("bloqueio:deleted", onBloqueioDeleted);

    };
  }, [id]);


  async function handleExcluir() {
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("Usuario excluído com sucesso");
      navigate('/usuarios')
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao excluir usuario");
    }
  }

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

    if (value.length <= 2) {
      return value;
    }

    if (value.length <= 4) {
      return `${value.slice(0, 2)}/${value.slice(2)}`;
    }

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

  async function salvarHorario() {
    if (!novoHorario.dia_semana || !novoHorario.hora_inicio || !novoHorario.intervalo_inicio || !novoHorario.intervalo_fim || !novoHorario.hora_fim) {
      toast.error("Preencha todos os campos do horário");
      return;
    }

    try {
      if (novoHorario.id) {
        const response = await api.put(`/horarios/${novoHorario.id}`, novoHorario);

        setHorarios(prev =>
          prev.map(h => h.id === response.data.id ? response.data : h)
        );

        toast.success("Horário atualizado com sucesso");
      } else {
        const response = await api.post(`/horarios`, {
          ...novoHorario,
          usuario_id: id
        });

        setHorarios(prev => {
          const index = prev.findIndex(h => h.id === response.data.id);

          if (index !== -1) {
            const atualizados = [...prev];
            atualizados[index] = response.data;
            return atualizados;
          }

          return [...prev, response.data];
        });

        toast.success("Horário criado com sucesso");
      }

      setNovoHorario({
        id: null,
        dia_semana: '',
        hora_inicio: '',
        intervalo_inicio: '',
        intervalo_fim: '',
        hora_fim: '',
        intervalo_atendimento: '',
        ativo: true
      });

    } catch (error) {
      toast.error("Erro ao salvar horário");
    }
  }

  async function excluirHorario(idHorario) {
    try {
      await api.delete(`/horarios/${idHorario}`);
      setHorarios(prev => prev.filter(h => h.id !== idHorario));

      toast.success("Horário removido com sucesso");
    } catch {
      toast.error("Erro ao remover horário");
    }
  }


  function editarHorario(horario) {
    setNovoHorario({
      id: horario.id,
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      intervalo_inicio: horario.intervalo_inicio,
      intervalo_fim: horario.intervalo_fim,
      hora_fim: horario.hora_fim,
      intervalo_atendimento: horario.intervalo_atendimento ?? '',
      ativo: horario.ativo
    });
  }


  function formatarDia(dia) {
    const dias = {
      0: "Domingo",
      1: "Segunda",
      2: "Terça",
      3: "Quarta",
      4: "Quinta",
      5: "Sexta",
      6: "Sábado"
    };

    return dias[dia] || "";
  }

  async function salvarBloqueio() {
    if (!novoBloqueio.data_inicio || !novoBloqueio.data_fim) {
      toast.error("Informe data início e fim");
      return;
    }

    const inicio = new Date(novoBloqueio.data_inicio);
    const fim = new Date(novoBloqueio.data_fim);

    if (fim <= inicio) {
      toast.error("A data final não pode ser menor ou igual à data inicial");
      return;
    }

    try {
      if (novoBloqueio.id) {
        await api.put(`/bloqueios/${novoBloqueio.id}`, novoBloqueio);
        toast.success("Bloqueio atualizado com sucesso");
      } else {
        await api.post(`/bloqueios`, {
          ...novoBloqueio,
          usuario_id: id
        });
        toast.success("Bloqueio criado com sucesso");
      }

      setNovoBloqueio({
        id: null,
        data_inicio: '',
        data_fim: '',
        motivo: ''
      });

    } catch {
      toast.error("Erro ao salvar bloqueio");
    }
  }


  async function excluirBloqueio(idBloqueio) {
    try {
      await api.delete(`/bloqueios/${idBloqueio}`);
      setBloqueios(prev => prev.filter(b => b.id !== idBloqueio));

      toast.success("Bloqueio removido com sucesso");
    } catch {
      toast.error("Erro ao remover bloqueio");
    }
  }

  function editarBloqueio(bloqueio) {
    setNovoBloqueio({
      id: bloqueio.id,
      data_inicio: formatarParaInput(bloqueio.data_inicio),
      data_fim: formatarParaInput(bloqueio.data_fim),
      motivo: bloqueio.motivo || ''
    });
  }

  function formatarParaInput(data) {
    const d = new Date(data);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const minuto = String(d.getMinutes()).padStart(2, '0');

    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
  }


  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSalvando(true);

      const payload = {
        ...form,
        data_nascimento: converterParaISO(form.data_nascimento)
      };

      if (isEdicao) {
        await api.put(`/usuarios/${id}`, payload);
        toast.success("Usuario atualizado");
      } else {
        await api.post(`/usuarios`, payload);
        toast.success("Usuario cadastrado");
        navigate('/usuarios')
      }
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <>
      <Header nome={isEdicao ? "Editar Usuario" : "Novo Usuario"} />

      <div className="usuario">
        <form className="card" onSubmit={handleSubmit}>
          <div className="grid">

            <h4>Dados</h4>
            <div className="row">
              <Input label="Nome" placeholder="Nome" name="nome" value={form.nome} onChange={handleChange} required />
              <Input label="Email" placeholder="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="row">

            </div>
            <div className="row">
              <Input
                label="CPF"
                placeholder="CPF"
                name="cpf"
                value={form.cpf}
                onChange={handleCpfChange}
              />
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
              <Select
                label="Tipo de usuário"
                value={form.tipo}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    tipo: value,
                  }))
                }
                options={[
                  { value: '', label: 'Selecione um tipo' },
                  { value: 'admin', label: 'Administrador' },
                  { value: 'medico', label: 'Médico/Nutricionista' },
                ]}
              />
            </div>

            <div className="row">
              <Input
                label="Telefone"
                placeholder="Telefone"
                name="telefone"
                value={form.telefone}
                onChange={handleTelefoneChange}
              />

              <Input
                label="CEP"
                placeholder="CEP"
                name="cep"
                value={form.cep}
                onChange={handleCepChange}
              />
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
              <button type="button" className="cancel" disabled={salvando} onClick={() => navigate('/usuarios')}>
                Voltar
              </button>
              <button type="submit" disabled={salvando}>
                {salvando
                  ? "Salvando..."
                  : isEdicao
                    ? "Atualizar"
                    : "Cadastrar"}
              </button>
            </div>
            {
              isEdicao &&
              <button type="button" className="delete" disabled={salvando} onClick={() => setConfirmarExclusao(true)}>
                Excluir
              </button>
            }

            {isEdicao && form.tipo === "medico" && (
              <>
                <div className="divisor-horizontal" />
                <h4>Horários de Atendimento</h4>

                <div className="row">
                  <Select
                    label="Dia da semana"
                    value={novoHorario.dia_semana}
                    onChange={(value) =>
                      setNovoHorario(prev => ({
                        ...prev,
                        dia_semana: value
                      }))
                    }
                    options={[
                      { value: '', label: 'Selecione' },
                      { value: 1, label: 'Segunda' },
                      { value: 2, label: 'Terça' },
                      { value: 3, label: 'Quarta' },
                      { value: 4, label: 'Quinta' },
                      { value: 5, label: 'Sexta' },
                      { value: 6, label: 'Sábado' },
                      { value: 0, label: 'Domingo' },
                    ]}
                  />
                  <Input
                    type="number"
                    label="Intervalo entre horários(min)"
                    placeholder="Intervalo entre horários(min)"
                    value={Number(novoHorario.intervalo_atendimento)}
                    onChange={(e) =>
                      setNovoHorario(prev => ({
                        ...prev,
                        intervalo_atendimento: e.target.value
                      }))
                    }
                  />
                </div>
                <div className="row">
                  <Input
                    label="Hora início"
                    type="time"
                    value={novoHorario.hora_inicio}
                    onChange={(e) =>
                      setNovoHorario(prev => ({
                        ...prev,
                        hora_inicio: e.target.value
                      }))
                    }
                  />

                  <Input
                    label="Intervalo início"
                    type="time"
                    value={novoHorario.intervalo_inicio}
                    onChange={(e) =>
                      setNovoHorario(prev => ({
                        ...prev,
                        intervalo_inicio: e.target.value
                      }))
                    }
                  />

                  <Input
                    label="Intervalo fim"
                    type="time"
                    value={novoHorario.intervalo_fim}
                    onChange={(e) =>
                      setNovoHorario(prev => ({
                        ...prev,
                        intervalo_fim: e.target.value
                      }))
                    }
                  />

                  <Input
                    label="Hora fim"
                    type="time"
                    value={novoHorario.hora_fim}
                    onChange={(e) =>
                      setNovoHorario(prev => ({
                        ...prev,
                        hora_fim: e.target.value
                      }))
                    }
                  />

                </div>
                <button type="button" onClick={salvarHorario}>
                  {novoHorario.id ? "Atualizar" : "Adicionar"}
                </button>

                <div className="horarios">
                  {horarios.map(h => (
                    <div key={h.id} className="horario">
                      <span>
                        {formatarDia(h.dia_semana)} - {h.hora_inicio.slice(0, 5)}h às {h.hora_fim.slice(0, 5)}h
                      </span>

                      <div className="row">
                        <button type="button" onClick={() => editarHorario(h)}>
                          Editar
                        </button>

                        <button type="button" className="delete" onClick={() => excluirHorario(h.id)}>
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {isEdicao && form.tipo === "medico" && (

              <>
                <div className="divisor-horizontal" />

                <h4>Bloqueios de Agenda</h4>

                <div className="row">
                  <Input
                    label="Data início"
                    type="datetime-local"
                    value={novoBloqueio.data_inicio}
                    onChange={(e) =>
                      setNovoBloqueio(prev => ({
                        ...prev,
                        data_inicio: e.target.value
                      }))
                    }
                  />

                  <Input
                    label="Data fim"
                    type="datetime-local"
                    min={novoBloqueio.data_inicio}
                    value={novoBloqueio.data_fim}
                    onChange={(e) =>
                      setNovoBloqueio(prev => ({
                        ...prev,
                        data_fim: e.target.value
                      }))
                    }
                  />

                  <Input
                    label="Motivo"
                    value={novoBloqueio.motivo}
                    onChange={(e) =>
                      setNovoBloqueio(prev => ({
                        ...prev,
                        motivo: e.target.value
                      }))
                    }
                  />

                  <button type="button" onClick={salvarBloqueio}>
                    {novoBloqueio.id ? "Atualizar" : "Adicionar"}
                  </button>
                </div>

                <div className="horarios">
                  {bloqueios.map(b => (
                    <div key={b.id} className="bloqueio">
                      <span>
                        {new Date(b.data_inicio).toLocaleString()} até {new Date(b.data_fim).toLocaleString()}
                        {b.motivo && ` - ${b.motivo}`}
                      </span>

                      <div className="row">
                        <button type="button" onClick={() => editarBloqueio(b)}>
                          Editar
                        </button>

                        <button type="button" className="delete" onClick={() => excluirBloqueio(b.id)}>
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="divisor-horizontal" />
              </>
            )}
          </div>
        </form>
      </div>
      {confirmarExclusao && (
        <Modal
          isOpen={confirmarExclusao}
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir este usuário?"
          cancelText="Cancelar"
          confirmText="Excluir"
          onCancel={() => {
            setConfirmarExclusao(false);
            setUsuarioParaExcluir(null);
          }}
          onConfirm={async () => {
            await handleExcluir();
            setConfirmarExclusao(false);
            setUsuarioParaExcluir(null);
          }}
        />
      )}
    </>
  );
}
