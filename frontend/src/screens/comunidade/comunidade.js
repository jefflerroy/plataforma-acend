import "./comunidade.css";
import { Header } from "../../components/header/header";

export function Comunidade() {

  return (
    <>
      <Header nome="Comunidade" />
      <div className="comunidade">
        <div className="container">
          <div className="publicar">
            <img alt="perfil" className="perfil" src="https://picsum.photos/seed/me/40/40" />
            <input
              type="text"
              placeholder="Compartilhe sua evolução..."
              value=""
            />
            <button className="postar">
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
              >
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <path d="M8 12h8"></path>
                <path d="M12 8v8"></path>
              </svg>
            </button>
          </div>

          <div className="post">
            <div className="cabecalho">
              <div className="info">
                <img src="https://picsum.photos/seed/user1/40/40" />
                <span>mariana_fit</span>
              </div>

              <svg
                className="opcoes"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </div>

            <img
              alt="postagem"
              className="postagem"
              src="https://picsum.photos/seed/gym1/600/600"
              loading="lazy"
            />

            <div className="acoes">
              <div className="interacao">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M19 14c1.49-1.46 3-3.21 3-5.5
                     A5.5 5.5 0 0 0 16.5 3
                     c-1.76 0-3 .5-4.5 2
                     c-1.5-1.5-2.74-2-4.5-2
                     A5.5 5.5 0 0 0 2 8.5
                     c0 2.3 1.5 4.05 3 5.5
                     l7 7Z"
                  ></path>
                </svg>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
                  ></path>
                </svg>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M14.536 21.686a.5.5 0 0 0
                     .937-.024l6.5-19a.496.496
                     0 0 0-.635-.635l-19 6.5
                     a.5.5 0 0 0-.024.937
                     l7.93 3.18a2 2 0 0 1
                     1.112 1.11z"
                  ></path>
                  <path
                    d="m21.854 2.147-10.94 10.939"
                  ></path>
                </svg>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="m19 21-7-4-7 4V5
                   a2 2 0 0 1 2-2h10
                   a2 2 0 0 1 2 2v16z"
                ></path>
              </svg>
            </div>

            <div className="dados">
              <span>124 curtidas</span>
              <p>
                <span>mariana_fit </span>
                Leg day concluído com sucesso! 🍑
                O foco no Método Ascend está trazendo
                resultados que nunca imaginei.
              </p>
              <label>2 horas atrás</label>
            </div>
            <div className="comentario">
              <input
                type="text"
                placeholder="Adicione um comentário..."
              />
              <button>Publicar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
