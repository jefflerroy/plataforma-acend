import "./evolucao.css";
import { Header } from "../../components/header/header";

export function Evolucao() {
  return (
    <>
      <Header nome="Evolucao" />
      <div className="evolucao">
        <div className="row">
          <div className="container">
            <div className="info">
              <h3>
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
                  color="var(--secundaria)"
                >
                  <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                  <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                  <path d="M7 21h10"></path>
                  <path d="M12 3v18"></path>
                  <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
                </svg>
                Peso Corporal (kg)
              </h3>

              <span>-4kg Total</span>
            </div>
            <div className="grafico">
            </div>
          </div>

          <div className="container">
            <div className="info">
              <h3>
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
                  color="var(--azul)"
                >
                  <line x1="19" y1="5" x2="5" y2="19"></line>
                  <circle cx="6.5" cy="6.5" r="2.5"></circle>
                  <circle cx="17.5" cy="17.5" r="2.5"></circle>
                </svg>
                Gordura Corporal
              </h3>

              <span>-6% Total</span>
            </div>

            <div className="grafico">
            </div>
          </div>
        </div>

        <div className="container">
          <h3>
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
              color="var(--laranja)"
            >
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
            </svg>
            Massa Muscular (kg)
          </h3>

          <div className="grafico">
          </div>
        </div>

        <div className="row" id="dados">
          <div className="container">
            <label>Melhor Mês</label>
            <h2>Março</h2>
            <p>Ganho de 0.7kg massa magra</p>
          </div>

          <div className="container">
            <label>Meta de Peso</label>
            <h2>78.0kg</h2>
            <p>Faltam 3.0kg</p>
          </div>

          <div className="container">
            <label>Última Bioimpedância</label>
            <h2>15 Mai</h2>
            <p>Consistência de 92% na dieta</p>
          </div>
        </div>
      </div>
    </>
  );
}
