import "./minha-dieta.css";
import { useState, useEffect } from "react";
import { Header } from "../../components/header/header";
import { GoClock, GoInfo } from "react-icons/go";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import api from "../../services/api";

export function MinhaDieta() {
  const [dieta, setDieta] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDieta() {
      try {
        const response = await api.get("/minha-dieta");
        setDieta(response.data?.dieta ?? null);
      } catch {
        setDieta(null);
      } finally {
        setLoading(false);
      }
    }

    loadDieta();
  }, []);

  const toggleDrop = (id) => setOpenId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <>
        <Header nome="Minha Dieta" />
        <div className="minha-dieta">
          <div className="container">
            <div className="row" id="card">
              <div className="info">
                <h2>Carregando...</h2>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!dieta) {
    return (
      <>
        <Header nome="Minha Dieta" />
        <div className="minha-dieta">
          <div className="container">
            <div className="row" id="card">
              <div className="info">
                <h2>Nenhuma dieta vinculada</h2>
                <p>Nenhuma dieta foi vinculada ao seu cadastro. Entre em contato com a clínica.</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const refeicoes = Array.isArray(dieta.refeicoes) ? dieta.refeicoes : [];

  const hasMacros = refeicoes.some(
    (r) => r.proteinas != null || r.carboidratos != null || r.gorduras != null || r.calorias != null
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
          </div>

          {refeicoes.map((refeicao) => (
            <div
              key={refeicao.id}
              className="column"
              id="card"
              onClick={() => toggleDrop(refeicao.id)}
              aria-expanded={openId === refeicao.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleDrop(refeicao.id);
              }}
            >
              <div className="topo">
                <div className="row">
                  <div className="horario">
                    <GoClock />
                    <p>{refeicao.horario}</p>
                  </div>

                  <div className="refeicao">
                    <h3>{refeicao.refeicao}</h3>
                    <small>Clique para visualizar os detalhes.</small>
                  </div>
                </div>

                <span
                  className="arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDrop(refeicao.id);
                  }}
                >
                  {openId === refeicao.id ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </div>

              {openId === refeicao.id && (
                <div className="drop">
                  {refeicao.descricao ? <div className="multiline">{refeicao.descricao}</div> : null}

                  {hasMacros && (
                    <div className="row" id="mini-cards">
                      {refeicao.proteinas != null ? (
                        <div className="mini-card">
                          <p>PROTEÍNAS</p>
                          <h3>{refeicao.proteinas}G</h3>
                        </div>
                      ) : null}

                      {refeicao.carboidratos != null ? (
                        <div className="mini-card">
                          <p>CARBOIDRATOS</p>
                          <h3>{refeicao.carboidratos}G</h3>
                        </div>
                      ) : null}

                      {refeicao.gorduras != null ? (
                        <div className="mini-card">
                          <p>GORDURAS</p>
                          <h3>{refeicao.gorduras}G</h3>
                        </div>
                      ) : null}

                      {refeicao.calorias != null ? (
                        <div className="mini-card">
                          <p>CALORIAS</p>
                          <h3>{refeicao.calorias} kcal</h3>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {dieta.observacao ? (
            <div className="observacao">
              <GoInfo className="icon" />
              <div className="colum">
                <h3>Observações da Dieta</h3>
                <div className="multiline">{dieta.observacao}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}