import "./meu-perfil.css";
import { useState, useEffect } from "react";
import { Header } from "../../components/header/header";
import api from "../../services/api";
import { Select } from "../../components/select/select";
import { Input } from "../../components/input/input";
import { toast } from "react-toastify";

export function MeuPerfil() {
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
    senhaAntiga: "",
    senha: "",
    confirmarSenha: "",
  });

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get("/me");
        const data = response.data;
        setUserId(data.id);

        setForm((prev) => ({
          ...prev,
          ...data,
          data_nascimento: formatarDataISO(data.data_nascimento),
        }));
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setForm((prev) => ({ ...prev, cpf: value }));
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

    setForm((prev) => ({ ...prev, telefone: value }));
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 8);

    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    }

    setForm((prev) => ({ ...prev, cep: value }));
  };

  function formatarDataISO(dataISO) {
    if (!dataISO) return "";

    const data = new Date(dataISO);
    const dia = String(data.getUTCDate()).padStart(2, "0");
    const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
    const ano = data.getUTCFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  function formatarData(value) {
    value = value.replace(/\D/g, "").slice(0, 8);

    if (value.length <= 2) return value;
    if (value.length <= 4) return `${value.slice(0, 2)}/${value.slice(2)}`;
    return `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
  }

  function handleDataNascimento(e) {
    const formatted = formatarData(e.target.value);
    setForm((prev) => ({ ...prev, data_nascimento: formatted }));
  }

  function converterParaISO(dataBR) {
    if (!dataBR) return null;
    const [dia, mes, ano] = dataBR.split("/");
    if (!dia || !mes || !ano) return null;
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.senha && form.senha !== form.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      await api.put(`/usuarios/${userId}`, {
        ...form,
        data_nascimento: converterParaISO(form.data_nascimento),
      });

      toast.success("Perfil atualizado com sucesso");
      setForm((prev) => ({ ...prev, senhaAntiga: "", senha: "", confirmarSenha: "" }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao atualizar");
    }
  }


  return (
    <>
      <Header nome="Meu Perfil" />

      <div className="meu-perfil">
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

              <h4>Alterar Senha</h4>

              <div className="row">
                <Input
                  type="password"
                  name="senhaAntiga"
                  value={form.senhaAntiga}
                  onChange={handleChange}
                  label="Senha atual"
                  placeholder="Senha atual"
                />
              </div>

              <div className="row">
                <Input
                  type="password"
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                  label="Nova senha"
                  placeholder="Nova senha"
                />
                <Input
                  type="password"
                  name="confirmarSenha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  label="Confirmar nova senha"
                  placeholder="Confirmar nova senha"
                />
              </div>

              <button type="submit">Salvar Alterações</button>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}
