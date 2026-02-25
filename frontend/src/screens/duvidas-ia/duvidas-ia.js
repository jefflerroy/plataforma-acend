import "./duvidas-ia.css";
import { Header } from "../../components/header/header";
import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { socket } from "../../services/socket";
import anonimo from '../../assets/anonimo.png'

export function DuvidasIa() {
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState('');
  const mensagensRef = useRef(null);

  async function carregarMensagens() {
    try {
      const { data } = await api.get("/chat");
      setMensagens(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function enviarMensagem() {
    if (!texto.trim()) return;

    try {
      setLoading(true);

      const mensagemLocal = {
        id: Date.now(),
        mensagem: texto,
        resposta_ia: false,
      };

      setMensagens((prev) => [mensagemLocal, ...prev]);
      const textoAtual = texto;
      setTexto("");

      await api.post("/chat/send", {
        mensagem: textoAtual,
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      enviarMensagem();
    }
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get("/me");
        const data = response.data;
        setFoto(data.foto)
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();

    carregarMensagens();

    socket.on("chat:new_message", (data) => {
      setMensagens((prev) => [data.mensagem, ...prev]);
      setLoading(false);
    });

    return () => {
      socket.off("chat:new_message");
    };
  }, []);

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop =
        mensagensRef.current.scrollHeight;
    }
  }, [mensagens, loading]);

  return (
    <>
      <Header nome="Chat" />
      <div className="duvidas-ia">
        <div className="chat">
          <div className="cabecalho">
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 8V4H8"></path>
                <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <div className="info">
              <h3>NutroIA</h3>
              <p>Assistente Inteligente</p>
            </div>
          </div>

          <div className="mensagens" ref={mensagensRef}>
            {mensagens
              .slice()
              .reverse()
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`mensagem ${msg.resposta_ia ? "ia" : "usuario"
                    }`}
                >
                  {msg.resposta_ia && (
                    <div className="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M12 8V4H8"></path>
                        <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                        <path d="M2 14h2"></path>
                        <path d="M20 14h2"></path>
                        <path d="M15 13v2"></path>
                        <path d="M9 13v2"></path>
                      </svg>
                    </div>
                  )}
                  <span className="texto">{msg.mensagem}</span>
                  {
                    !msg.resposta_ia && <img alt='perfil' className='perfil' src={foto || anonimo} />
                  }
                </div>
              ))}

            {loading && (
              <div className="mensagem ia">
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                  </svg>
                </div>
                <span className="texto">Digitando...</span>
              </div>
            )}
          </div>

          <div className="inferior">
            <div className="enviar">
              <input
                type="text"
                placeholder="Qual sua dúvida hoje?"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                onClick={enviarMensagem}
                disabled={loading || !texto.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                </svg>
              </button>
            </div>

            <p>
              IA pode cometer erros.
              Consulte sempre seu médico para decisões clínicas.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}