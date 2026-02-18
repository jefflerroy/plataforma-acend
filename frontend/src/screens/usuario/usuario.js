import "./usuario.css";
import { Header } from "../../components/header/header";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
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
        }
      } catch {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [id, isEdicao]);

  async function handleExcluir() {
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("Usuario excluído com sucesso");
      navigate('/usuarios')
    } catch (error){
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
            <button type="button" className="delete" disabled={salvando} onClick={() => setConfirmarExclusao(true)}>
              Excluir
            </button>
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
