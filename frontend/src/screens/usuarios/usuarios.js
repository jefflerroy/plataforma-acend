import "./usuarios.css";
import { Header } from "../../components/header/header";
import { MdLogin } from "react-icons/md";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const response = await api.get("/usuarios");        

        setUsuarios(response.data);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarUsuarios();
  }, []);
  
  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      <Header nome="Usuarios" />
      <div className="usuarios">
        <div className="lista">
          <button onClick={() => navigate('/usuario/novo')}>Cadastrar</button>
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
                  <th>Tipo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} onClick={() => navigate(`/usuario/${usuario.id}`)} style={{ cursor: 'pointer' }}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.tipo === "admin" ? "Administrador" : "Médico/Nutricionista"}</td>
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
