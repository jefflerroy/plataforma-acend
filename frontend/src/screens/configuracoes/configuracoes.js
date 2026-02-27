import "./configuracoes.css";
import { Header } from "../../components/header/header";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { Input } from "../../components/input/input";
import { Select } from "../../components/select/select";
import { socket } from "../../services/socket";

function mascararTelefone(valor) {
  let value = String(valor || "").replace(/\D/g, "");
  value = value.slice(0, 11);

  if (value.length > 10) {
    value = value.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
  } else if (value.length > 6) {
    value = value.replace(/(\d{2})(\d{4,5})(\d{1,4})/, "($1) $2-$3");
  } else if (value.length > 2) {
    value = value.replace(/(\d{2})(\d{1,5})/, "($1) $2");
  } else if (value.length > 0) {
    value = value.replace(/(\d*)/, "($1");
  }

  return value;
}

function telefoneParaE164BR(telefoneMascara) {
  const digits = String(telefoneMascara || "").replace(/\D/g, "");
  if (!digits) return null;
  return `55${digits}`;
}

function e164ParaMascaraBR(e164) {
  const digits = String(e164 || "").replace(/\D/g, "");
  if (!digits) return "";
  const sem55 = digits.startsWith("55") ? digits.slice(2) : digits;
  return mascararTelefone(sem55);
}

export function Configuracoes() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    bloquear_agendamentos: false,
    chatgpt_key: "",
    whatsapp_agendamentos: "",
  });

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTelefoneChange = (e) => {
    const value = mascararTelefone(e.target.value);
    setForm((prev) => ({
      ...prev,
      whatsapp_agendamentos: value,
    }));
  };

  const carregar = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/configuracoes");
      setForm({
        bloquear_agendamentos: !!data.bloquear_agendamentos,
        chatgpt_key: data.chatgpt_key || "",
        whatsapp_agendamentos: e164ParaMascaraBR(data.whatsapp_agendamentos || ""),
      });
    } catch (err) {
      const msg = err?.response?.data?.error || "Erro ao carregar configurações";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);

      const payload = {
        bloquear_agendamentos: !!form.bloquear_agendamentos,
        chatgpt_key: form.chatgpt_key?.trim() || null,
        whatsapp_agendamentos: telefoneParaE164BR(form.whatsapp_agendamentos),
      };

      await api.put("/configuracoes", payload);
      toast.success("Configurações atualizadas com sucesso");
    } catch (err) {
      const msg = err?.response?.data?.error || "Erro ao salvar configurações";
      toast.error(msg);
    } finally {
      setSalvando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    const onUpdated = (data) => {
      setForm({
        bloquear_agendamentos: !!data.bloquear_agendamentos,
        chatgpt_key: data.chatgpt_key || "",
        whatsapp_agendamentos: e164ParaMascaraBR(data.whatsapp_agendamentos || ""),
      });
    };

    socket.on("configuracoes:updated", onUpdated);

    return () => {
      socket.off("configuracoes:updated", onUpdated);
    };
  }, []);

  return (
    <>
      <Header nome="Configurações" />
      <div className="configuracoes">
        <form className="card" onSubmit={handleSubmit}>
          <div className="grid">
            <h4>Configurações</h4>

            <div className="row">
              <Select
                label="Bloquear agendamentos"
                value={form.bloquear_agendamentos ? "true" : "false"}
                onChange={(v) => handleChange("bloquear_agendamentos", v === "true")}
                options={[
                  { label: "Não", value: "false" },
                  { label: "Sim", value: "true" },
                ]}
              />

              <Input
                label="WhatsApp para agendamentos"
                placeholder="Ex: (48) 99999-9999"
                name="whatsapp_agendamentos"
                value={form.whatsapp_agendamentos}
                onChange={handleTelefoneChange}
              />
            </div>

            <div className="row">
              <Input
                label="ChatGPT Key"
                placeholder="sk-..."
                name="chatgpt_key"
                value={form.chatgpt_key}
                onChange={(e) => handleChange("chatgpt_key", e.target.value)}
              />
            </div>

            <button type="submit" className="btn" disabled={loading || salvando}>
              {salvando ? "Salvando..." : loading ? "Carregando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}