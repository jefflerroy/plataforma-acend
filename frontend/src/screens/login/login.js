import "./login.css";
import { PenasCaindo } from "../../components/penasCaindo/penasCaindo";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate()
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
        <div className="input">
          <label htmlFor="email">Email:</label>
          <input placeholder="Email..." />
        </div>
        <div className="input">
          <label htmlFor="senha">Senha:</label>
          <input placeholder="Senha..." />
          <p className="link">Esqueci minha senha</p>
        </div>
        <button onClick={() => navigate('/inicio')}>Entrar</button>        
      </div>
    </div>
  );
}
