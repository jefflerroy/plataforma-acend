import "./paciente.css";
import { Header } from "../../components/header/header";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Input } from "../../components/input/input";

export function Paciente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdicao = id !== "novo";

  const [loading, setLoading] = useState(isEdicao);
  const [salvando, setSalvando] = useState(false);

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
    if (isEdicao) {
      async function carregarPaciente() {
        try {
          const response = await api.get(`/usuarios/${id}`);
          setForm(response.data);
        } catch (error) {
          console.error("Erro ao carregar paciente:", error);
        } finally {
          setLoading(false);
        }
      }

      carregarPaciente();
    }
  }, [id, isEdicao]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSalvando(true);

      if (isEdicao) {
        await api.put(`/usuarios/${id}`, form);
      } else {
        await api.post(`/paciente`, form);
      }

      navigate("/pacientes");
    } catch (error) {
      console.error("Erro ao salvar:", error);
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
              <Input
                label="Nome"
                name="nome"
                placeholder="Nome"
                value={form.nome}
                onChange={handleChange}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <Input
                label="CPF"
                name="cpf"
                placeholder="CPF"
                value={form.cpf}
                onChange={handleChange}
              />

              <Input
                label="Data de nascimento"
                name="data_de_nascimento"
                placeholder="Data de nascimento"
                value={form.cpf}
                onChange={handleChange}
              />

              <Input
                label="Sexo"
                name="sexo"
                placeholder="Sexo"
                value={form.sexo}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <Input
                label="Telefone"
                name="telefone"
                placeholder="Telefone"
                value={form.telefone}
                onChange={handleChange}
              />

              <Input
                label="CEP"
                name="cep"
                placeholder="CEP"
                value={form.cep}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <Input
                label="Rua"
                name="rua"
                placeholder="Rua"
                value={form.rua}
                onChange={handleChange}
              />

              <Input
                label="Número"
                name="numero"
                placeholder="Número"
                value={form.numero}
                onChange={handleChange}
              />

              <Input
                label="Complemento"
                name="complemento"
                placeholder="Complemento"
                value={form.complemento}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <Input
                label="Bairro"
                name="bairro"
                placeholder="Bairro"
                value={form.bairro}
                onChange={handleChange}
              />

              <Input
                label="Cidade"
                name="cidade"
                placeholder="Cidade"
                value={form.cidade}
                onChange={handleChange}
              />

              <Input
                label="Estado"
                name="estado"
                placeholder="Estado"
                value={form.estado}
                onChange={handleChange}
              />
            </div>
            <button type="submit" disabled={salvando}>
              {salvando
                ? "Salvando..."
                : isEdicao
                  ? "Atualizar"
                  : "Cadastrar"}
            </button>
          </div>
        </form>

        {
          isEdicao &&
          <>
            <div className="grid">
              <h4>Dieta</h4>
            </div>
            <div className="grid">
              <h4>Agenda</h4>
            </div>
          </>
        }
      </div>
    </>
  );
}
