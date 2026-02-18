import "./minha-dieta.css";
import { useState, useEffect } from "react";
import { Header } from "../../components/header/header";
import { GoClock, GoCheckCircle, GoInfo } from "react-icons/go";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import api from "../../services/api";

export function MinhaDieta() {
  const [dieta, setDieta] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    async function loadDieta() {
      try {
        const response = await api.get("/minha-dieta");
        setDieta(response.data.dieta);
      } catch (err) {
        console.error(err);
      }
    }

    loadDieta();
  }, []);

  const toggleDrop = (id) => {
    setOpenId(openId === id ? null : id);
  };

  if (!dieta) return null;

  const refeicoes = dieta.refeicoes || [];

  const totalCalorias = refeicoes.reduce(
    (total, r) => total + Number(r.calorias || 0),
    0
  );

  const totalProteinas = refeicoes.reduce(
    (total, r) => total + Number(r.proteinas || 0),
    0
  );

  const totalCarboidratos = refeicoes.reduce(
    (total, r) => total + Number(r.carboidratos || 0),
    0
  );

  const totalGorduras = refeicoes.reduce(
    (total, r) => total + Number(r.gorduras || 0),
    0
  );

  return (
    <>
      <Header nome="Minha Dieta" />

      <div className="minha-dieta">
        <div className="container">

          <div className="row" id="card">
            <div className="info">
              <h2>Dieta Atual</h2>
              <p>{dieta.titulo}</p>
            </div>

            <div className="info-kcal">
              <h2>{totalCalorias} kcal</h2>
              <p>KCAL TOTAL/DIA</p>
            </div>
          </div>

          {refeicoes.map((refeicao) => (
            <div
              key={refeicao.id}
              className="column"
              id="card"
              onClick={() => toggleDrop(refeicao.id)}
              aria-expanded={openId === refeicao.id}
            >
              <div className="topo">
                <div className="horario">
                  <GoClock />
                  <p>{refeicao.horario}</p>
                </div>

                <div className="refeicao">
                  <h3>{refeicao.refeicao}</h3>
                  <p>{refeicao.descricao}</p>
                </div>

                <p className="proteina">P: {refeicao.proteinas}G</p>
                <p className="carboidrato">C: {refeicao.carboidratos}G</p>
                <p className="gordura">G: {refeicao.gorduras}G</p>

                <span
                  className="arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDrop(refeicao.id);
                  }}
                >
                  {openId === refeicao.id ? (
                    <IoIosArrowUp />
                  ) : (
                    <IoIosArrowDown />
                  )}
                </span>
              </div>

              {openId === refeicao.id && (
                <div className="drop">
                  <p>{refeicao.descricao}</p>

                  <div className="row" id="mini-cards">
                    <div className="mini-card">
                      <p>PROTEÍNAS</p>
                      <h3>{refeicao.proteinas}G</h3>
                    </div>

                    <div className="mini-card">
                      <p>CARBOIDRATOS</p>
                      <h3>{refeicao.carboidratos}G</h3>
                    </div>

                    <div className="mini-card">
                      <p>GORDURAS</p>
                      <h3>{refeicao.gorduras}G</h3>
                    </div>

                    <div className="mini-card">
                      <p>CALORIAS</p>
                      <h3>{refeicao.calorias} kcal</h3>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {dieta.observacao && (
            <div className="observacao">
              <GoInfo className="icon" />
              <div className="colum">
                <h3>Observações da Dieta</h3>
                <p>{dieta.observacao}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
