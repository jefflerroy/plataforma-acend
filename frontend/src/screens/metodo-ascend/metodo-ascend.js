import "./metodo-ascend.css";
import { Header } from "../../components/header/header";

export function MetodoAscend() {
  return (
    <>
      <Header nome="Método Ascend" />

      <div className="metodo-ascend">
        <div className="topo">
          <h2>Método Ascend</h2>
          <p>Sua jornada personalizada para a melhor versão da sua saúde.</p>
        </div>

        <div className="linha-temporal">
          <div className="linha-centralizada" />

          <div className="cards">
            <div className="card">
              <div className="check">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  color="var(--quaternaria)"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>

              <div className="conteudo">
                <div className="titulo">
                  <div className="badge">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      color="var(--azul)"
                    >
                      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                    </svg>
                  </div>

                  <div>
                    <span>Mês 1</span>
                    <h3>Desintoxicação &amp; Base</h3>
                  </div>
                </div>

                <p>
                  Foco na limpeza metabólica, ajuste de sono e hidratação. Preparação do terreno biológico.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="check">
                <div className="pulse" />
              </div>

              <div className="conteudo">
                <div className="titulo">
                  <div className="badge">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      color="var(--quaternaria)"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>

                  <div>
                    <span>Mês 2-3</span>
                    <h3>Reprogramação Metabólica</h3>
                  </div>
                </div>

                <p>
                  Otimização da queima de gordura e sensibilidade à insulina. Introdução de protocolos específicos.
                </p>

                <div className="rodape">
                  <span>Fase Atual • 65% Concluído</span>
                  <button>
                    Ver Detalhes
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"

                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="check">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  color="var(--borda)"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>

              <div className="conteudo">
                <div className="titulo">
                  <div className="badge">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      color="red"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                  </div>

                  <div>
                    <span>Mês 4-6</span>
                    <h3>Alta Performance</h3>
                  </div>
                </div>

                <p>
                  Foco em hipertrofia e máxima energia. Ajuste fino de suplementação avançada.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="proximos-passos">
          <h3>Próximos Passos</h3>

          <ul>
            <li class="is-done">
              <span class="icon">
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
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </span>
              <span class="text">Coleta de exames laboratoriais (Realizado)</span>
            </li>

            <li class="is-done">
              <span class="icon">
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
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </span>
              <span class="text">Ajuste da dieta para Fase 2 (Realizado)</span>
            </li>

            <li class="is-next">
              <span class="dot" aria-hidden="true"></span>
              <span class="text">Consulta de retorno em 15 dias</span>
            </li>
          </ul>
        </div>

      </div>
    </>
  );
}
