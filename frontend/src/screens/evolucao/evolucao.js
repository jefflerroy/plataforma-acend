import "./evolucao.css";
import { Header } from "../../components/header/header";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import Chart from "chart.js/auto";
import { toast } from "react-toastify";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export function Evolucao() {
  const pacienteId = Number(localStorage.getItem("id"));

  const [evolucoes, setEvolucoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const pesoCanvasRef = useRef(null);
  const gorduraCanvasRef = useRef(null);
  const musculoCanvasRef = useRef(null);
  const massaGorduraCanvasRef = useRef(null);
  const imcCanvasRef = useRef(null);

  const pesoChartRef = useRef(null);
  const gorduraChartRef = useRef(null);
  const musculoChartRef = useRef(null);
  const massaGorduraChartRef = useRef(null);
  const imcChartRef = useRef(null);

  const [evolucaoAbertaId, setEvolucaoAbertaId] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const res = await api.get(`/minhas-evolucoes`);
        setEvolucoes(Array.isArray(res.data) ? res.data : []);
      } catch {
        setEvolucoes([]);
      } finally {
        setLoading(false);
      }
    }

    if (pacienteId) carregar();
    else {
      setEvolucoes([]);
      setLoading(false);
    }
  }, [pacienteId]);

  const dadosOrdenados = useMemo(() => {
    const list = [...evolucoes];
    list.sort((a, b) => {
      const da = new Date(a.created_at || a.createdAt).getTime();
      const db = new Date(b.created_at || b.createdAt).getTime();
      return da - db;
    });
    return list;
  }, [evolucoes]);

  const labels = useMemo(() => {
    return dadosOrdenados.map((ev) => {
      const d = new Date(ev.created_at || ev.createdAt);
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    });
  }, [dadosOrdenados]);

  const serie = useMemo(() => {
    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(String(v).replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };

    return {
      peso: dadosOrdenados.map((ev) => toNum(ev.peso)),
      gorduraPercentual: dadosOrdenados.map((ev) => toNum(ev.percentual_gordura)),
      musculo: dadosOrdenados.map((ev) => toNum(ev.massa_muscular)),
      massaGordura: dadosOrdenados.map((ev) => toNum(ev.massa_gordura)),
      imc: dadosOrdenados.map((ev) => toNum(ev.imc)),
    };
  }, [dadosOrdenados]);

  const totalPeso = useMemo(() => {
    const first = serie.peso.find((v) => v != null);
    const last = [...serie.peso].reverse().find((v) => v != null);
    if (first == null || last == null) return null;
    return last - first;
  }, [serie.peso]);

  const totalGordura = useMemo(() => {
    const first = serie.gorduraPercentual.find((v) => v != null);
    const last = [...serie.gorduraPercentual].reverse().find((v) => v != null);
    if (first == null || last == null) return null;
    return last - first;
  }, [serie.gorduraPercentual]);

  const totalMusculo = useMemo(() => {
    const first = serie.musculo.find((v) => v != null);
    const last = [...serie.musculo].reverse().find((v) => v != null);
    if (first == null || last == null) return null;
    return last - first;
  }, [serie.musculo]);

  const totalMassaGordura = useMemo(() => {
    const first = serie.massaGordura.find((v) => v != null);
    const last = [...serie.massaGordura].reverse().find((v) => v != null);
    if (first == null || last == null) return null;
    return last - first;
  }, [serie.massaGordura]);

  const totalImc = useMemo(() => {
    const first = serie.imc.find((v) => v != null);
    const last = [...serie.imc].reverse().find((v) => v != null);
    if (first == null || last == null) return null;
    return last - first;
  }, [serie.imc]);

  const ultimaEvolucao = useMemo(() => {
    if (dadosOrdenados.length === 0) return null;
    return dadosOrdenados[dadosOrdenados.length - 1];
  }, [dadosOrdenados]);

  const melhorMesMusculo = useMemo(() => {
    if (dadosOrdenados.length < 2) return null;

    let best = null;

    for (let i = 1; i < dadosOrdenados.length; i++) {
      const prev = Number(String(dadosOrdenados[i - 1].massa_muscular || "").replace(",", "."));
      const cur = Number(String(dadosOrdenados[i].massa_muscular || "").replace(",", "."));

      if (!Number.isFinite(prev) || !Number.isFinite(cur)) continue;

      const diff = cur - prev;
      const dt = new Date(dadosOrdenados[i].created_at || dadosOrdenados[i].createdAt);

      if (!best || diff > best.diff) {
        best = {
          diff,
          monthLabel: dt.toLocaleDateString("pt-BR", { month: "long" }),
        };
      }
    }

    return best;
  }, [dadosOrdenados]);

  function toggleEvolucao(id) {
    setEvolucaoAbertaId((prev) => (prev === id ? null : id));
  }

  function formatarDataHora(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  }

  async function abrirBioimpedancia(ev) {
    try {
      const response = await api.get(`/evolucoes/${ev.id}/pdf`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(response.data);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      toast.error("Erro ao abrir PDF");
    }
  }

  const criarOuAtualizarChart = (ref, canvasRef, labelsArr, dataArr, sufixo) => {
    if (!canvasRef.current) return;

    if (ref.current) {
      ref.current.destroy();
      ref.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");

    ref.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labelsArr,
        datasets: [
          {
            label: "",
            data: dataArr,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 4,
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const v = context.parsed.y;
                if (v === null || v === undefined) return "";
                return `${v}${sufixo || ""}`;
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { display: true },
            ticks: { precision: 2 },
          },
        },
      },
    });
  };

  useEffect(() => {
    if (loading) return;

    criarOuAtualizarChart(pesoChartRef, pesoCanvasRef, labels, serie.peso, "kg");
    criarOuAtualizarChart(gorduraChartRef, gorduraCanvasRef, labels, serie.gorduraPercentual, "%");
    criarOuAtualizarChart(musculoChartRef, musculoCanvasRef, labels, serie.musculo, "kg");
    criarOuAtualizarChart(massaGorduraChartRef, massaGorduraCanvasRef, labels, serie.massaGordura, "kg");
    criarOuAtualizarChart(imcChartRef, imcCanvasRef, labels, serie.imc, "");

    return () => {
      if (pesoChartRef.current) pesoChartRef.current.destroy();
      if (gorduraChartRef.current) gorduraChartRef.current.destroy();
      if (musculoChartRef.current) musculoChartRef.current.destroy();
      if (massaGorduraChartRef.current) massaGorduraChartRef.current.destroy();
      if (imcChartRef.current) imcChartRef.current.destroy();
      pesoChartRef.current = null;
      gorduraChartRef.current = null;
      musculoChartRef.current = null;
      massaGorduraChartRef.current = null;
      imcChartRef.current = null;
    };
  }, [loading, labels, serie.peso, serie.gorduraPercentual, serie.musculo, serie.massaGordura, serie.imc]);

  const formatDelta = (v, sufixo) => {
    if (v == null) return "—";
    const abs = Math.abs(v).toFixed(1);
    const sign = v > 0 ? "+" : v < 0 ? "-" : "";
    return `${sign}${abs}${sufixo}`;
  };

  const formatUltimaData = (ev) => {
    if (!ev) return "—";
    const d = new Date(ev.created_at || ev.createdAt);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <>
      <Header nome="Evolucao" />
      <div className="evolucao">
        <div className="row">
          <div className="container">
            <div className="info">
              <h3>
                Peso Corporal (kg)
              </h3>

              <span>{formatDelta(totalPeso, "kg")} Total</span>
            </div>

            <div className="grafico">
              <canvas ref={pesoCanvasRef} />
            </div>
          </div>

          <div className="container">
            <div className="info">
              <h3>
                Gordura Corporal (%)
              </h3>

              <span>{formatDelta(totalGordura, "%")} Total</span>
            </div>

            <div className="grafico">
              <canvas ref={gorduraCanvasRef} />
            </div>
          </div>
        </div>

        <div className="container">
          <h3>
            Massa Muscular (kg)
          </h3>

          <div className="grafico">
            <canvas ref={musculoCanvasRef} />
          </div>
        </div>

        <div className="row">
          <div className="container">
            <div className="info">
              <h3>Massa Gordura (kg)</h3>
              <span>{formatDelta(totalMassaGordura, "kg")} Total</span>
            </div>
            <div className="grafico">
              <canvas ref={massaGorduraCanvasRef} />
            </div>
          </div>

          <div className="container">
            <div className="info">
              <h3>IMC</h3>
              <span>{formatDelta(totalImc, "")} Total</span>
            </div>
            <div className="grafico">
              <canvas ref={imcCanvasRef} />
            </div>
          </div>
        </div>

        <div className="row" id="dados">
          <div className="container">
            <label>Melhor Mês</label>
            <h2>{(melhorMesMusculo ? melhorMesMusculo.monthLabel : "—").toUpperCase()}</h2>
            <p>{melhorMesMusculo ? `Ganho de ${melhorMesMusculo.diff.toFixed(1)}kg massa magra` : "—"}</p>
          </div>

          <div className="container">
            <label>Última Bioimpedância</label>
            <h2>{formatUltimaData(ultimaEvolucao)}</h2>
            <p>{ultimaEvolucao?.bioimpedancia_url ? "PDF disponível" : "Sem PDF"}</p>
          </div>
        </div>

        <div className="evolucoes-list">
          <h4>Evolucões</h4>
          {loading ? (
            <p>Carregando evoluções...</p>
          ) : evolucoes.length === 0 ? (
            <p>Nenhuma evolução cadastrada.</p>
          ) : (
            evolucoes.map((ev) => (
              <div
                key={ev.id}
                className="evolucao-item"
                onClick={() => toggleEvolucao(ev.id)}
                aria-expanded={evolucaoAbertaId === ev.id}
              >
                <div className="topo">
                  <p>Evolução - {formatarDataHora(ev.created_at || ev.createdAt)}</p>
                  {evolucaoAbertaId === ev.id ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div>
                {evolucaoAbertaId === ev.id && (
                  <div className="evolucao-detalhes">
                    <p>Peso: {ev.peso}kg</p>
                    <p>Massa muscular: {ev.massa_muscular}kg</p>
                    <p>Massa gordura: {ev.massa_gordura}kg</p>
                    <p>PGC: {ev.percentual_gordura}%</p>
                    <p>IMC: {ev.imc}kg/m²</p>
                    {ev.bioimpedancia_url && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirBioimpedancia(ev);
                        }}
                      >
                        Ver PDF da bioimpedância
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}