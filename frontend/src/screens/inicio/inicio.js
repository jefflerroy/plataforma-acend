import "./inicio.css";
import { Header } from "../../components/header/header";
import { FiTarget } from "react-icons/fi";
import { ImSpoonKnife } from "react-icons/im";
import { LuCalendar } from "react-icons/lu";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

function formatarExpiracao(dataISO) {
  if (!dataISO) return "";

  const data = new Date(dataISO);

  data.setUTCMonth(data.getUTCMonth() + 6);

  const dia = String(data.getUTCDate()).padStart(2, "0");
  const ano = data.getUTCFullYear();

  const mes = data.toLocaleString("pt-BR", {
    month: "short",
    timeZone: "UTC"
  });

  return `${dia} de ${mes} ${ano}`;
}

function formatarDataLocal(dataISO) {
  if (!dataISO) return "";

  const [ano, mes, dia] = dataISO.split("-");
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  });
}

export function Inicio() {
  const navigate = useNavigate();

  const [dieta, setDieta] = useState(null);
  const [proximaRefeicao, setProximaRefeicao] = useState(null);
  const [totalPosts, setTotalPosts] = useState(null);
  const [proximaConsulta, setProximaConsulta] = useState(null);
  const [evolucoes, setEvolucoes] = useState([]);
  const [dataExpiracao, setDataExpiracao] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get("/me");
        const data = response.data;
        setDataExpiracao(data.createdAt);
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    async function loadDieta() {
      try {
        const response = await api.get("/minha-dieta");
        const d = response.data?.dieta || null;
        setDieta(d);
        if (d?.refeicoes?.length) setProximaRefeicao(proximaRefeicaoDieta(d));
      } catch { }
    }

    async function loadTotalPosts() {
      try {
        const response = await api.get("/posts-total");
        setTotalPosts(response.data?.total ?? null);
      } catch { }
    }

    async function loadProximaConsulta() {
      try {
        const pacienteId = localStorage.getItem("id");
        const response = await api.get("/agendamentos-proxima", {
          params: { paciente_id: pacienteId },
        });
        setProximaConsulta(response.data || null);
      } catch { }
    }

    async function loadEvolucoes() {
      try {
        const response = await api.get("/minhas-evolucoes");
        setEvolucoes(Array.isArray(response.data) ? response.data : []);
      } catch {
        setEvolucoes([]);
      }
    }

    loadDieta();
    loadTotalPosts();
    loadProximaConsulta();
    loadEvolucoes();
  }, []);

  function proximaRefeicaoDieta(d) {
    const agora = new Date();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();

    const refeicoesOrdenadas = (d.refeicoes || [])
      .slice()
      .sort((a, b) => {
        const [hA, mA] = a.horario.split(":").map(Number);
        const [hB, mB] = b.horario.split(":").map(Number);
        return hA - hB || mA - mB;
      });

    for (const refeicao of refeicoesOrdenadas) {
      const [h, m] = refeicao.horario.split(":").map(Number);
      if (horaAtual < h || (horaAtual === h && minutoAtual < m)) return refeicao;
    }

    return refeicoesOrdenadas[0] || null;
  }

  const massaMagraCard = useMemo(() => {
    const list = [...evolucoes].sort((a, b) => {
      const da = new Date(a.created_at || a.createdAt).getTime();
      const db = new Date(b.created_at || b.createdAt).getTime();
      return da - db;
    });

    if (list.length < 2) {
      return { h2: "—", info: "Sem dados suficientes", disabled: true };
    }

    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(String(v).replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };

    const first = toNum(list[0].massa_muscular);
    const last = toNum(list[list.length - 1].massa_muscular);

    if (first == null || last == null) {
      return { h2: "—", info: "Sem dados suficientes", disabled: true };
    }

    const diff = last - first;
    const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
    const h2 = `${sign}${Math.abs(diff).toFixed(1)}kg`;

    const info = `Desde ${new Date(list[0].created_at || list[0].createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    })}`;

    return { h2, info, disabled: false };
  }, [evolucoes]);

  const cardsTopo = [
    {
      id: "refeicao",
      icon: <ImSpoonKnife className="icon" style={{ color: "var(--laranja)" }} />,
      titulo: "PRÓXIMA REFEIÇÃO",
      h2: proximaRefeicao?.refeicao || "—",
      info: proximaRefeicao?.horario ? `${proximaRefeicao.horario}` : "Sem dieta ativa",
      onClick: () => navigate("/minha-dieta"),
      disabled: !proximaRefeicao,
    },
    {
      id: "consulta",
      icon: <LuCalendar className="icon" style={{ color: "var(--azul)" }} />,
      titulo: "PRÓXIMA CONSULTA",
      h2: proximaConsulta
        ? formatarDataLocal(proximaConsulta.data)
        : "Nenhuma",
      info: proximaConsulta
        ? `${proximaConsulta.hora.slice(0, 5)} - ${proximaConsulta.profissional?.nome}`
        : "Nenhuma consulta marcada",
      onClick: () => navigate("/minha-agenda"),
    },
    {
      id: "massa",
      icon: <FaArrowTrendUp className="icon" style={{ color: "var(--terciaria)" }} />,
      titulo: "MASSA MAGRA",
      h2: massaMagraCard.h2,
      info: massaMagraCard.info,
      onClick: () => navigate("/evolucao"),
      disabled: massaMagraCard.disabled,
    },
    {
      id: "comunidade",
      icon: <MdOutlinePeopleAlt className="icon" style={{ color: "var(--roxo)" }} />,
      titulo: "COMUNIDADE",
      h2: totalPosts ?? "—",
      info: "Novos posts hoje",
      onClick: () => navigate("/comunidade"),
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
            <h1 className="hero__title">Bem-vindo, {localStorage.getItem("nome")}</h1>
            <p className="hero__text">
              Seu progresso no Método Ascend está excelente.
            </p>
            <button className="hero__btn" type="button" onClick={() => navigate("/metodo-ascend")}>
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

        <div className="row">
          <section className="grid grid--2cols" style={{width: "100%"}}>
            <SectionCard title="Dica do Dia (IA)">
              <p className="tip">{dica}</p>
              <button className="linkBtn" type="button" onClick={() => navigate("/duvidas-ia")}>
                Falar com a AscendIA
              </button>
            </SectionCard>
          </section>
          <Card
            className="expiracao"
            icon={<LuCalendar className="icon" style={{ color: "var(--vermelho)" }} />}
            titulo="DATA DE EXPIRAÇÃO"
            h2={formatarExpiracao(dataExpiracao)}
          />
        </div>
      </div>
    </>
  );
}