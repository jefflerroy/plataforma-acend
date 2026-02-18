import "./inicio.css";
import { Header } from "../../components/header/header";
import { FiTarget } from "react-icons/fi";
import { ImSpoonKnife } from "react-icons/im";
import { LuCalendar } from "react-icons/lu";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { BarraSolida } from "../../components/barraSolida/barraSolida";
import { useNavigate } from "react-router-dom";

function Card({ icon, titulo, h2, info, onClick, disabled = false }) {
  const clickable = typeof onClick === "function" && !disabled;
  const Tag = clickable ? "button" : "div";

  return (
    <Tag
      className={`card ${clickable ? "card--clickable" : ""} ${disabled ? "card--disabled" : ""}`}
      type={clickable ? "button" : undefined}
      onClick={clickable ? onClick : undefined}
      aria-disabled={disabled ? "true" : undefined}
    >
      <div className="card__title">
        <span className="card__icon">{icon}</span>
        <p className="card__kicker">{titulo}</p>
      </div>
      <h2 className="card__h2">{h2}</h2>
      <p className="card__info">{info}</p>
    </Tag>
  );
}

function SectionCard({ title, rightText, children }) {
  return (
    <div className="card card--disabled" aria-disabled="true">
      <div className="card__header">
        <h3 className="card__h3">{title}</h3>
        {rightText ? <p className="card__muted">{rightText}</p> : null}
      </div>
      <div className="card__body">{children}</div>
    </div>
  );
}

export function Inicio() {
  const navigate = useNavigate();

  const cardsTopo = [
    {
      id: "refeicao",
      icon: <ImSpoonKnife className="icon" style={{ color: "var(--laranja)" }} />,
      titulo: "PRÓXIMA REFEIÇÃO",
      h2: "Almoço",
      info: "12:30 - 580kcal",
      onClick: () => console.log("refeicao"),
    },
    {
      id: "consulta",
      icon: <LuCalendar className="icon" style={{ color: "var(--azul)" }} />,
      titulo: "PRÓXIMA CONSULTA",
      h2: "14 Mar",
      info: "15:00 - Dr. Mendes",
      onClick: () => console.log("consulta"),
    },
    {
      id: "massa",
      icon: <FaArrowTrendUp className="icon" style={{ color: "var(--terciaria)" }} />,
      titulo: "MASSA MAGRA",
      h2: "+1.2kg",
      info: "Últimos 30 dias",
      onClick: () => console.log("massa"),
    },
    {
      id: "comunidade",
      icon: <MdOutlinePeopleAlt className="icon" style={{ color: "var(--roxo)" }} />,
      titulo: "COMUNIDADE",
      h2: "12",
      info: "Novos posts hoje",
      onClick: () => console.log("comunidade"),
    },
  ];

  const dica =
    '"Aumentar a ingestão de água hoje ajudará na sua recuperação muscular após o treino intenso de ontem. Tente bater 3.5 litros!"';

  return (
    <>
      <Header nome="Dashboard" />
      <div className="inicio">
        <section className="hero">
          <div className="hero__content">
            <h1 className="hero__title">Bem-vindo, {localStorage.getItem('nome')}</h1>
            <p className="hero__text">
              Seu progresso no Método Ascend está excelente. Faltam apenas 3kg para sua meta de fase 1.
            </p>
            <button className="hero__btn" type="button" onClick={() => navigate('/metodo-ascend')}>
              Ver Minha Jornada
            </button>
          </div>
          <FiTarget className="hero__icon" aria-hidden="true" />
        </section>

        <section className="grid">
          {cardsTopo.map((c) => (
            <Card key={c.id} {...c} />
          ))}
        </section>

        <section className="grid grid--2cols">
          <SectionCard title="Resumo de Macronutrientes" rightText="Hoje">
            <div className="stack">
              <BarraSolida atual={140} max={180} label="Proteínas" />
              <BarraSolida atual={90} max={120} label="Carboidratos" color="var(--azul)" />
              <BarraSolida atual={45} max={65} label="Gorduras" color="var(--laranja)" />
              <BarraSolida atual={1850} max={2200} label="Calorias" color="var(--roxo)" />
            </div>
          </SectionCard>

          <SectionCard title="Dica do Dia (IA)">
            <p className="tip">{dica}</p>
            <button className="linkBtn" type="button" onClick={() => console.log("nutroia")}>
              Falar com a NutroIA
            </button>
          </SectionCard>
        </section>
      </div>
    </>
  );
}
