import "./paciente.css";
import { Header } from "../../components/header/header";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { Input } from "../../components/input/input";
import { Select } from "../../components/select/select";

export function Paciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = id !== "novo";

  const [loading, setLoading] = useState(isEdicao);
  const [salvando, setSalvando] = useState(false);

  const [vinculoAtual, setVinculoAtual] = useState(null);
  const [dietaAtiva, setDietaAtiva] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [buscaModal, setBuscaModal] = useState("");
  const [dietasModal, setDietasModal] = useState([]);
  const [dietaSelecionada, setDietaSelecionada] = useState(null);

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
    tipo: "paciente"
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

          const vinculos = await api.get(
            `/dietas-usuarios?paciente_id=${id}`
          );

          if (vinculos.data.length > 0) {
            const vinculo = vinculos.data[0];
            setVinculoAtual(vinculo);
            setDietaAtiva(vinculo.dieta);
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

            <div className="divisor-horizontal"/>

            <h4>Dieta ativa</h4>

            {dietaAtiva ? (
              <div className="dieta-box">
                <h4>{dietaAtiva.titulo}</h4>

                <div className="row">
                  {dietaAtiva.refeicoes?.map((ref, index) => (
                    <div key={index} className="refeicao-dropdown-item">
                      <strong>{ref.horario} - {ref.refeicao}</strong>
                      <small>{ref.descricao}</small>
                      <small>
                        P: {ref.proteinas} | C: {ref.carboidratos} | G: {ref.gorduras} | Kcal: {ref.calorias}
                      </small>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setModalAberto(true)}
                >
                  Alterar dieta
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setModalAberto(true)}
              >
                Vincular dieta
              </button>
            )}

            <div className="row">
              <button type="button" className="cancel" disabled={salvando} onClick={() => navigate('/pacientes')}>
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
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={salvarVinculo}
                  disabled={!dietaSelecionada}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
