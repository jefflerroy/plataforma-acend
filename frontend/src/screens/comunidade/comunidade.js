import "./comunidade.css";
import { Header } from "../../components/header/header";
import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import anonimo from "../../assets/anonimo.png";
import { socket } from "../../services/socket";
import { Modal } from "../../components/modal/modal";
import { MdDelete } from "react-icons/md";

export function Comunidade() {
  const [posts, setPosts] = useState([]);
  const [textoPost, setTextoPost] = useState("");
  const [imagem, setImagem] = useState(null);
  const [user, setUser] = useState({ nome: "", foto: "", id: null, tipo: "" });

  const [comentariosPorPost, setComentariosPorPost] = useState({});
  const [comentarioTextoPorPost, setComentarioTextoPorPost] = useState({});
  const [comentariosAbertos, setComentariosAbertos] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTexto, setModalTexto] = useState({ title: "", message: "" });
  const [acaoPendente, setAcaoPendente] = useState(null);

  const isAdmin = user?.tipo === "admin";

  const comentariosAbertosRef = useRef({});
  const syncComentariosAbertos = (updater) => {
    setComentariosAbertos((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      comentariosAbertosRef.current = next;
      return next;
    });
  };

  const abrirConfirmacao = (title, message, callback) => {
    setModalTexto({ title, message });
    setAcaoPendente(() => callback);
    setModalOpen(true);
  };

  const podeExcluirPost = (post) => {
    const donoId = post.usuario_id ?? post.usuario?.id;
    return isAdmin || (donoId && donoId === user.id);
  };

  const podeExcluirComentario = (c) => {
    const donoId = c.usuario_id ?? c.usuario?.id;
    return isAdmin || (donoId && donoId === user.id);
  };

  const excluirPost = (postId) => {
    abrirConfirmacao("Excluir Post", "Tem certeza que deseja excluir este post?", async () => {
      await api.delete(`/posts/${postId}`);
      setModalOpen(false);
    });
  };

  const excluirComentario = (comentarioId) => {
    abrirConfirmacao("Excluir Comentário", "Tem certeza que deseja excluir este comentário?", async () => {
      await api.delete(`/posts/comment/${comentarioId}`);
      setModalOpen(false);
    });
  };

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

  const carregarComentariosDoPost = async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    const comentarios = response.data?.comentarios || [];
    setComentariosPorPost((prev) => ({ ...prev, [postId]: comentarios }));
  };

  const alternarComentarios = async (postId) => {
    syncComentariosAbertos((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!comentariosPorPost[postId]) {
      await carregarComentariosDoPost(postId);
    }
  };

  const postarComentario = async (postId) => {
    const comentario = (comentarioTextoPorPost[postId] || "").trim();
    if (!comentario) return;

    await api.post(`/posts/comment`, {
      post_id: postId,
      usuario_id: user.id,
      comentario
    });

    setComentarioTextoPorPost((prev) => ({ ...prev, [postId]: "" }));
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
      setPosts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    });

    socket.on("post:deleted", ({ id }) => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setComentariosPorPost((prev) => {
        const novo = { ...prev };
        delete novo[id];
        return novo;
      });
      syncComentariosAbertos((prev) => {
        const novo = { ...prev };
        delete novo[id];
        return novo;
      });
      setComentarioTextoPorPost((prev) => {
        const novo = { ...prev };
        delete novo[id];
        return novo;
      });
    });

    socket.on("post:liked", ({ post_id, total_curtidas }) => {
      setPosts((prev) => prev.map((p) => (p.id === post_id ? { ...p, total_curtidas } : p)));
    });

    socket.on("post:unliked", ({ post_id, total_curtidas }) => {
      setPosts((prev) => prev.map((p) => (p.id === post_id ? { ...p, total_curtidas } : p)));
    });

    socket.on("post:commented", ({ post_id, total_comentarios, comentario }) => {
      setPosts((prev) => prev.map((p) => (p.id === post_id ? { ...p, total_comentarios } : p)));

      if (comentariosAbertosRef.current[post_id]) {
        setComentariosPorPost((prev) => {
          const lista = prev[post_id] || [];
          const existe = lista.some((c) => c.id === comentario?.id);
          if (existe) return prev;
          return { ...prev, [post_id]: [comentario, ...lista] };
        });
      }
    });

    socket.on("post:commentDeleted", ({ post_id, total_comentarios, comentario_id }) => {
      setPosts((prev) => prev.map((p) => (p.id === post_id ? { ...p, total_comentarios } : p)));

      setComentariosPorPost((prev) => {
        const lista = prev[post_id] || [];
        if (!lista.length) return prev;
        const depois = lista.filter((c) => c.id !== comentario_id);
        return { ...prev, [post_id]: depois };
      });
    });

    return () => {
      socket.off("post:created");
      socket.off("post:updated");
      socket.off("post:deleted");
      socket.off("post:liked");
      socket.off("post:unliked");
      socket.off("post:commented");
      socket.off("post:commentDeleted");
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
                onChange={(e) => setTextoPost(e.target.value)}
              />
            </div>
            <input type="file" accept="image/*" onChange={handleImagemChange} />
            <button className="postar" onClick={handlePostar}>
              Postar
            </button>
          </div>

          {posts.map((post) => (
            <div className="post" key={post.id}>
              <div className="cabecalho">
                <div className="info">
                  <img src={post.usuario?.foto || anonimo} alt="perfil" />
                  <span>{post.usuario?.nome}</span>
                </div>

                {podeExcluirPost(post) && (
                  <MdDelete className="iconDelete" onClick={() => excluirPost(post.id)} />
                )}
              </div>

              {post.imagem && <img className="postagem" alt="postagem" src={post.imagem} loading="lazy" />}

              <div className="acoes">
                <div className="interacao">
                  <svg
                    onClick={() => {
                      const body = { post_id: post.id, usuario_id: user.id };
                      setPosts((prev) =>
                        prev.map((p) => {
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
                    <path
                      d="M19 14c1.49-1.46 3-3.21 3-5.5
               A5.5 5.5 0 0 0 16.5 3
               c-1.76 0-3 .5-4.5 2
               -1.5-1.5-2.74-2-4.5-2
               A5.5 5.5 0 0 0 2 8.5
               c0 2.3 1.5 4.05 3 5.5
               l7 7Z"
                    />
                  </svg>
                  <span>{post.total_curtidas || 0} curtidas</span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    onClick={() => alternarComentarios(post.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                  </svg>
                  <span>{post.total_comentarios || 0} comentários</span>
                </div>
              </div>

              <div className="dados">
                <p>
                  <span>{post.usuario?.nome} </span>
                  {post.legenda}
                </p>
                <label>
                  {new Date(post.createdAt).toLocaleDateString()}{" "}
                  {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </label>
              </div>

              {comentariosAbertos[post.id] && (
                <div className="comentarios">
                  <div className="comentarios-lista">
                    {(comentariosPorPost[post.id] || []).map((c) => (
                      <div className="comentario" key={c.id}>
                        <img src={c.usuario?.foto || anonimo} alt="perfil" className="perfil" />
                        <div className="comentario-texto">
                          <span className="comentario-nome">{c.usuario?.nome || "Usuário"}</span>
                          <small>{c.comentario}</small>
                        </div>
                        {podeExcluirComentario(c) && (
                          <MdDelete className="iconDelete" onClick={() => excluirComentario(c.id)} />
                        )}
                      </div>
                    ))}

                    {!comentariosPorPost[post.id]?.length && (
                      <span className="comentario-vazio">Nenhum comentário ainda</span>
                    )}
                  </div>

                  <div className="comentario-form">
                    <input
                      type="text"
                      placeholder="Escreva um comentário..."
                      value={comentarioTextoPorPost[post.id] || ""}
                      onChange={(e) =>
                        setComentarioTextoPorPost((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") postarComentario(post.id);
                      }}
                    />
                    <button type="button" onClick={() => postarComentario(post.id)}>
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        title={modalTexto.title}
        message={modalTexto.message}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          if (acaoPendente) acaoPendente();
        }}
      />
    </>
  );
}