import "./minha-agenda.css";
import { Header } from "../../components/header/header";

export function MinhaAgenda() {
  return (
    <>
      <Header nome="Minha Agenda" />
      <div className="minha-agenda">
        <div className="container">
          <div className="cabecalho">
            <div>
              <h2>Minha Agenda</h2>
              <p>Gerencie suas consultas e exames Ascend.</p>
            </div>

            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Novo Agendamento
            </button>
          </div>

          <div className="agendamento">
            <div className="dados">
              <div className="data">
                <span className="mes">Março</span>
                <span className="dia">14</span>
              </div>

              <div className="info">
                <div className="status">
                  <span>Consulta</span>
                  <span>Confirmado</span>
                </div>
                <h3>Dr. Fernando Mendes</h3>
                <div className="local">
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>15:00</span>
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
                      d="M20 10c0 4.993-5.539 10.193-7.399 11.799
                     a1 1 0 0 1-1.202 0
                     C9.539 20.193 4 14.993 4 10
                     a8 8 0 0 1 16 0"
                    ></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Clínica Ascend - Jardins</span>
                </div>
              </div>
            </div>

            <div className="acoes">
              <button>Reagendar</button>

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
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </div>
          </div>
          <div className="historico">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                <path d="M3 10h18"></path>
              </svg>
            </div>

            <h4>Nenhuma consulta anterior registrada</h4>
            <p>
              Suas consultas concluídas aparecerão aqui para fácil consulta de histórico.
            </p>
          </div>
        </div>
      </div>

    </>
  );
}
