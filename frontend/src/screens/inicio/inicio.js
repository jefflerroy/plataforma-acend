import "./inicio.css";
import { Header } from "../../components/header/header";
import { FiTarget } from "react-icons/fi";
import { ImSpoonKnife } from "react-icons/im";
import { LuCalendar } from "react-icons/lu";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { BarraSolida } from "../../components/barraSolida/barraSolida";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

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
  const [dieta, setDieta] = useState(null);
  const [proximaRefeicao, setProximaRefeicao] = useState(null);
  const [macronutrientes, setMacronutrientes] = useState(null);
  const [totalPosts, setTotalPosts] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [proximaConsulta, setProximaConsulta] = useState(null);

  useEffect(() => {
    async function loadDieta() {
      try {
        const response = await api.get("/minha-dieta");
        let dieta = response.data.dieta;
        setDieta(dieta);
        setProximaRefeicao(proximaRefeicaoDieta(dieta))
        setMacronutrientes(calcularTotais(dieta))
      } catch (err) {
        console.error(err);
      }
    }
    async function totalPosts() {
      try {
        const response = await api.get("/posts-total");
        setTotalPosts(response.data.total)
      } catch (err) {
        console.error(err);
      }
    }
    async function loadProximaConsulta() {
      try {
        const pacienteId = localStorage.getItem("id");

        const response = await api.get("/agendamentos-proxima", {
          params: { paciente_id: pacienteId }
        });

        setProximaConsulta(response.data);

      } catch (err) {
        console.error(err);
      }
    }

    loadDieta();
    totalPosts();
    loadProximaConsulta();
  }, []);

  function proximaRefeicaoDieta(dieta) {
    const agora = new Date();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();

    const refeicoesOrdenadas = dieta.refeicoes
      .slice()
      .sort((a, b) => {
        const [hA, mA] = a.horario.split(':').map(Number);
        const [hB, mB] = b.horario.split(':').map(Number);
        return hA - hB || mA - mB;
      });

    for (const refeicao of refeicoesOrdenadas) {
      const [h, m] = refeicao.horario.split(':').map(Number);
      if (horaAtual < h || (horaAtual === h && minutoAtual < m)) {
        return refeicao;
      }
    }

    return refeicoesOrdenadas[0];
  }

  function calcularTotais(dieta) {
    const agora = new Date();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();

    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;
    let totalCalorias = 0;

    let consumidoProteinas = 0;
    let consumidoCarboidratos = 0;
    let consumidoGorduras = 0;
    let consumidoCalorias = 0;

    for (const refeicao of dieta.refeicoes) {
      totalProteinas += refeicao.proteinas;
      totalCarboidratos += refeicao.carboidratos;
      totalGorduras += refeicao.gorduras;
      totalCalorias += refeicao.calorias;

      const [h, m] = refeicao.horario.split(':').map(Number);
      if (horaAtual > h || (horaAtual === h && minutoAtual >= m)) {
        consumidoProteinas += refeicao.proteinas;
        consumidoCarboidratos += refeicao.carboidratos;
        consumidoGorduras += refeicao.gorduras;
        consumidoCalorias += refeicao.calorias;
      }
    }

    return {
      total: {
        proteinas: totalProteinas,
        carboidratos: totalCarboidratos,
        gorduras: totalGorduras,
        calorias: totalCalorias
      },
      consumido: {
        proteinas: consumidoProteinas,
        carboidratos: consumidoCarboidratos,
        gorduras: consumidoGorduras,
        calorias: consumidoCalorias
      }
    };
  }

  const cardsTopo = [
    {
      id: "refeicao",
      icon: <ImSpoonKnife className="icon" style={{ color: "var(--laranja)" }} />,
      titulo: "PRÓXIMA REFEIÇÃO",
      h2: proximaRefeicao?.refeicao,
      info: `${proximaRefeicao?.horario} - ${proximaRefeicao?.calorias}kcal`,
      onClick: () => navigate('/minha-dieta'),
    },
    {
      id: "consulta",
      icon: <LuCalendar className="icon" style={{ color: "var(--azul)" }} />,
      titulo: "PRÓXIMA CONSULTA",
      h2: proximaConsulta
        ? new Date(proximaConsulta.data).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short"
        })
        : "Nenhuma",
      info: proximaConsulta
        ? `${proximaConsulta.hora.slice(0, 5)} - ${proximaConsulta.profissional?.nome}`
        : "Nenhuma consulta marcada",
      onClick: () => navigate('/minha-agenda'),
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
      h2: totalPosts,
      info: "Novos posts hoje",
      onClick: () => navigate('/comunidade'),
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
              <BarraSolida atual={macronutrientes?.consumido.proteinas} max={macronutrientes?.total.proteinas} label="Proteínas" />
              <BarraSolida atual={macronutrientes?.consumido.carboidratos} max={macronutrientes?.total.carboidratos} label="Carboidratos" color="var(--azul)" />
              <BarraSolida atual={macronutrientes?.consumido.gorduras} max={macronutrientes?.total.gorduras} label="Gorduras" color="var(--laranja)" />
              <BarraSolida atual={macronutrientes?.consumido.calorias} max={macronutrientes?.total.calorias} label="Calorias" color="var(--roxo)" />
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
