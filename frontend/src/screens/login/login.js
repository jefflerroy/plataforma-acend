import "./login.css";
import { PenasCaindo } from "../../components/penasCaindo/penasCaindo";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api"; 

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault(); 

    try {
      setErro("");
      setLoading(true);

      const response = await api.post("/login", {
        email,
        senha,
      });

      const { token, usuario } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("id", usuario.id);
      localStorage.setItem("tipo", usuario.tipo);
      localStorage.setItem("email", usuario.email);
      localStorage.setItem("nome", usuario.nome);
      
      if (window.socket) {
        window.socket.auth = { token };
        window.socket.connect();
      }



      navigate(`/${usuario.tipo === 'paciente' ? 'inicio' : 'agenda'}`);
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="esquerda">
        <PenasCaindo />
        <div className="mensagem">
          <p className="titulo">Ascend Method</p>
          <p className="subtitulo">Evolua sua saúde. Eleve seu padrão.</p>
        </div>
      </div>

      <div className="direita">
        <h1>Bem-vindo</h1>        

        <form onSubmit={handleLogin}>
          <div className="input">
            <label>Email:</label>
            <input
              placeholder="Email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input">
            <label>Senha:</label>
            <input
              type="password"
              placeholder="Senha..."
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {erro && <p className="erro">{erro}</p>}
        </form>
      </div>
    </div>
  );
}
