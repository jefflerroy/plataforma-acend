import "./duvidas-ia.css";
import { Header } from "../../components/header/header";

export function DuvidasIa() {
  return (
    <>
      <Header nome="Chat" />
      <div className="duvidas-ia">
        <div className="chat">
          <div className="cabecalho">
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
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
              <h3>
                NutroIA
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M9.937 15.5A2 2 0 0 0 8.5 14.063
               l-6.135-1.582a.5.5 0 0 1 0-.962
               L8.5 9.936A2 2 0 0 0 9.937 8.5
               l1.582-6.135a.5.5 0 0 1 .963 0
               L14.063 8.5A2 2 0 0 0 15.5 9.937
               l6.135 1.581a.5.5 0 0 1 0 .964
               L15.5 14.063a2 2 0 0 0-1.437 1.437
               l-1.582 6.135a.5.5 0 0 1-.963 0z"
                  ></path>
                  <path d="M20 3v4"></path>
                  <path d="M22 5h-4"></path>
                  <path d="M4 17v2"></path>
                  <path d="M5 18H3"></path>
                </svg>
              </h3>

              <p>Assistente Inteligente</p>
            </div>
          </div>

          <div className="mensagens">
            <div className="mensagem">
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

              <span className="texto">
                Olá! Sou o assistente da Ascend Nutrologia.
                Como posso te ajudar hoje com sua dieta,
                treinos ou dúvidas do Método Ascend?
              </span>
            </div>
          </div>

          <div className="inferior">
            <div className="enviar">
              <input
                type="text"
                placeholder="Qual sua dúvida hoje?"
                value=""
              />

              <button disabled>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M14.536 21.686a.5.5 0 0 0
               .937-.024l6.5-19a.496.496
               0 0 0-.635-.635l-19 6.5
               a.5.5 0 0 0-.024.937
               l7.93 3.18a2 2 0 0 1
               1.112 1.11z"
                  ></path>
                  <path d="m21.854 2.147-10.94 10.939"></path>
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
