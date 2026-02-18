import "./comunidade.css";
import { Header } from "../../components/header/header";
import { useEffect, useState } from "react";
import api from "../../services/api";
import anonimo from '../../assets/anonimo.png'
import { socket } from "../../services/socket";

export function Comunidade() {
  const [posts, setPosts] = useState([]);
  const [textoPost, setTextoPost] = useState("");
  const [imagem, setImagem] = useState(null);
  const [user, setUser] = useState({ nome: "", foto: "", id: null });

  const imageToBase64 = (file, tamanho = 600, qualidade = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = tamanho;
          canvas.height = tamanho;
          const ctx = canvas.getContext("2d");
          const menor = Math.min(img.width, img.height);
          const sx = (img.width - menor) / 2;
          const sy = (img.height - menor) / 2;
          ctx.drawImage(img, sx, sy, menor, menor, 0, 0, tamanho, tamanho);
          resolve(canvas.toDataURL("image/jpeg", qualidade));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    async function loadUser() {
      const response = await api.get("/me");
      setUser(response.data);
    }

    async function loadPosts() {
      const response = await api.get("/posts");
      setPosts(response.data);
    }

    loadUser();
    loadPosts();

    socket.on("post:created", ({ data }) => {
      setPosts((prev) => [data, ...prev]);
    });

    socket.on("post:updated", ({ data }) => {
      setPosts((prev) => prev.map(p => p.id === data.id ? data : p));
    });

    socket.on("post:deleted", ({ id }) => {
      setPosts((prev) => prev.filter(p => p.id !== id));
    });

    socket.on("post:liked", ({ post_id, total_curtidas }) => {
      setPosts(prev => prev.map(p => p.id === post_id ? { ...p, total_curtidas } : p));
    });

    socket.on("post:unliked", ({ post_id, total_curtidas }) => {
      setPosts(prev => prev.map(p => p.id === post_id ? { ...p, total_curtidas } : p));
    });

    socket.on("post:commented", ({ post_id, total_comentarios }) => {
      setPosts(prev => prev.map(p => p.id === post_id ? { ...p, total_comentarios } : p));
    });

    return () => {
      socket.off("post:created");
      socket.off("post:updated");
      socket.off("post:deleted");
      socket.off("post:liked");
      socket.off("post:unliked");
      socket.off("post:commented");
    };
  }, []);

  const handleImagemChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await imageToBase64(file);
    setImagem(base64);
  };

  const handlePostar = async () => {
    if (!textoPost && !imagem) return;

    await api.post("/posts", {
      usuario_id: user.id,
      legenda: textoPost,
      imagem
    });

    setTextoPost("");
    setImagem(null);
  };

  const handleCurtir = async (post) => {
    const body = { post_id: post.id, usuario_id: user.id };
    if (!post.curtido) {
      await api.post("/posts/like", body);
    } else {
      await api.post("/posts/unlike", body);
    }
  };

  const handleComentar = async (post, comentario) => {
    if (!comentario) return;
    await api.post("/posts/comment", { post_id: post.id, usuario_id: user.id, comentario });
  };

  return (
    <>
      <Header nome="Comunidade" />
      <div className="comunidade">
        <div className="container">

          <div className="publicar">
            <div className="row">
              <img alt="perfil" className="perfil" src={user.foto || anonimo} />
              <input
                type="text"
                placeholder="Compartilhe sua evolução..."
                value={textoPost}
                onChange={e => setTextoPost(e.target.value)}
              />
            </div>
            <input type="file" accept="image/*" onChange={handleImagemChange} />
            <button className="postar" onClick={handlePostar}>
              Postar
            </button>
          </div>

          {posts.map(post => (
            <div className="post" key={post.id}>
              <div className="cabecalho">
                <div className="info">
                  <img src={post.usuario?.foto || anonimo} alt="perfil" />
                  <span>{post.usuario?.nome}</span>
                </div>
              </div>

              {post.imagem && (
                <img className="postagem" alt="postagem" src={post.imagem} loading="lazy" />
              )}

              <div className="acoes">
                <div className="interacao">
                  <svg
                    onClick={async () => {
                      const body = { post_id: post.id, usuario_id: user.id };
                      setPosts(prev =>
                        prev.map(p => {
                          if (p.id !== post.id) return p;

                          const curtidas = Number(p.total_curtidas) || 0;

                          if (!p.curtido) {
                            api.post("/posts/like", body);
                            return { ...p, total_curtidas: curtidas + 1, curtido: true };
                          } else {
                            api.post("/posts/unlike", body);
                            return { ...p, total_curtidas: Math.max(curtidas - 1, 0), curtido: false };
                          }
                        })
                      );
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill={post.curtido ? "var(--vermelho)" : "none"}
                    stroke={post.curtido ? "var(--vermelho)" : "currentColor"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ cursor: "pointer" }}
                    className="lucide lucide-heart"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5
               A5.5 5.5 0 0 0 16.5 3
               c-1.76 0-3 .5-4.5 2
               -1.5-1.5-2.74-2-4.5-2
               A5.5 5.5 0 0 0 2 8.5
               c0 2.3 1.5 4.05 3 5.5
               l7 7Z" />
                  </svg>
                  <span>{post.total_curtidas || 0} curtidas</span>
                </div>
              </div>

              <div className="dados">
                <p>
                  <span>{post.usuario?.nome} </span>
                  {post.legenda}
                </p>
                <label>
                  {new Date(post.createdAt).toLocaleDateString()} {' '}
                  {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </label>
              </div>
            </div>
          ))}

        </div>
      </div>
    </>
  );
}
