import "./pacientes.css";
import { Header } from "../../components/header/header";
import { MdLogin } from "react-icons/md";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export function Pacientes() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const response = await api.get("/pacientes");
        
        const pacientes = response.data.filter(
          (usuario) => usuario.tipo === "paciente"
        );

        setUsuarios(pacientes);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarUsuarios();
  }, []);
  
  const pacientesFiltrados = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      <Header nome="Pacientes" />
      <div className="pacientes">
        <div className="lista">
          <button onClick={() => navigate('/paciente/novo')}>Cadastrar</button>
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
                  <th>Nome</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((usuario) => (
                  <tr key={usuario.id} onClick={() => navigate(`/paciente/${usuario.id}`)} style={{ cursor: 'pointer' }}>
                    <td>{usuario.nome}</td>
                    <td>
                      {new Date(usuario.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <MdLogin />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
