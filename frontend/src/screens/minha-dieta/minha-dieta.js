import "./minha-dieta.css";
import { useState } from "react";
import { Header } from "../../components/header/header";
import { GoClock, GoCheckCircle, GoInfo } from "react-icons/go";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

export function MinhaDieta() {
  const [drop, setDrop] = useState(false);

  const toggleDrop = () => setDrop((v) => !v);

  return (
    <>
      <Header nome="Minha Dieta" />
      <div className="minha-dieta">
        <div className="row" id="card" aria-disabled="true">
          <div className="info">
            <h2>Plano Alimentar Atual</h2>
            <p>Fase 2: Hipertrofia Moderada</p>
          </div>
          <div className="info-kcal">
            <h2>2.150</h2>
            <p>KCAL TOTAL/DIA</p>
          </div>
        </div>

        <div
          className="column"
          id="card"
          onClick={toggleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") toggleDrop();
          }}
          aria-expanded={drop}
        >
          <div className="topo">
            <div className="horario">
              <GoClock />
              <p>07:30</p>
            </div>

            <div className="refeicao">
              <h3>Café da Manhã</h3>
              <p>Ovos mexidos (3 unidades), 1 fatia de pão integral, 1/2 abacate e café sem açúcar.</p>
            </div>

            <p className="proteina">P: 24G</p>
            <p className="carboidrato"> C: 18G</p>
            <p className="gordura">G: 22G</p>

            <GoCheckCircle
              className="check"
              onClick={(e) => {
                e.stopPropagation();
                console.log("check");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  console.log("check");
                }
              }}
              aria-label="Marcar como concluída"
            />

            <span
              className="arrow"
              onClick={(e) => {
                e.stopPropagation();
                toggleDrop();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  toggleDrop();
                }
              }}
              aria-label={drop ? "Fechar detalhes" : "Abrir detalhes"}
            >
              {drop ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
          </div>

          {drop && (
            <div className="drop">
              <p>Ovos mexidos (3 unidades), 1 fatia de pão integral, 1/2 abacate e café sem açúcar.</p>
              <div className="row" id="mini-cards">
                <div className="mini-card">
                  <p>PROTEÍNAS</p>
                  <h3 style={{ color: "var(--secundaria)" }}>24G</h3>
                </div>
                <div className="mini-card">
                  <p>CARBOS</p>
                  <h3 style={{ color: "var(--azul)" }}>44G</h3>
                </div>
                <div className="mini-card">
                  <p>GORDURAS</p>
                  <h3 style={{ color: "var(--laranja)" }}>54G</h3>
                </div>
                <div className="mini-card">
                  <p>CALORIAS</p>
                  <h3 style={{ color: "var(--roxo)" }}>380kcal</h3>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("registrar");
                }}
              >
                Registrar Refeição
              </button>
            </div>
          )}
        </div>

        <div className="observacao">
          <GoInfo className="icon" />
          <div className="colum">
            <h3>Observações do Dr. Ricardo</h3>
            <p>
              Mantenha a hidratação constante. Se sentir fraqueza no treino, adicione 20g de palatinose ao
              pré-treino. Evite ingerir líquidos durante as refeições principais.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
