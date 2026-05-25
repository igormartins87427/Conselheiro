"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AuthGuard from "../../components/AuthGuard";

interface Message {
  role: "user" | "assistant";
  content: string;
  limitReached?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingConversationId, setEditingConversationId] = useState<
    string | null
  >(null);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const welcomeMessage: Message = {
    role: "assistant",
    content:
      "Olá. Sou o Conselheiro da Fé. Estou aqui para ouvir você com acolhimento, respeito e serenidade. Como você está se sentindo hoje?",
  };

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);

  async function loadConversations(userId: string) {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setConversations(data);
  }

  async function loadMessages(userId: string, currentConversationId: string) {
    const { data } = await supabase
      .from("messages")
      .select("role, content")
      .eq("user_id", userId)
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      setMessages(
        data.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
      );
    } else {
      setMessages([welcomeMessage]);
    }
  }

  useEffect(() => {
    async function setupConversation() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profile?.name) setUserName(profile.name);

      await loadConversations(user.id);

      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let currentConversationId = existingConversation?.id;

      if (!currentConversationId) {
        const { data: newConversation } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title: "Nova conversa",
          })
          .select()
          .single();

        if (!newConversation) return;

        currentConversationId = newConversation.id;
        await loadConversations(user.id);
      }

      setConversationId(currentConversationId);
      await loadMessages(user.id, currentConversationId);
    }

    setupConversation();
  }, []);

  async function handleNewConversation() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: "Nova conversa",
      })
      .select()
      .single();

    if (!newConversation) return;

    setConversationId(newConversation.id);
    setMessages([welcomeMessage]);
    await loadConversations(user.id);
  }

  async function handleSelectConversation(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setConversationId(id);
    await loadMessages(user.id, id);
  }

  async function handleRenameConversation() {
    if (!editingConversationId || !newConversationTitle.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("conversations")
      .update({ title: newConversationTitle.trim() })
      .eq("id", editingConversationId)
      .eq("user_id", user.id);

    await loadConversations(user.id);
    setEditingConversationId(null);
    setNewConversationTitle("");
  }

  async function handleDeleteConversation(id: string) {
    const confirmDelete = confirm("Deseja apagar esta conversa?");
    if (!confirmDelete) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", id)
      .eq("user_id", user.id);

    await supabase
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    await loadConversations(user.id);

    if (conversationId === id) {
      setConversationId(null);
      setMessages([welcomeMessage]);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handleSendMessage() {
    if (!message.trim()) return;

    const userMessage = message;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !conversationId) {
      alert("Você precisa estar logado para conversar.");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessage("");
    setLoading(true);

    await supabase.from("messages").insert({
      user_id: user.id,
      conversation_id: conversationId,
      role: "user",
      content: userMessage,
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.limitReached) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            limitReached: true,
          },
        ]);

        setLoading(false);
        return;
      }

      await supabase.from("messages").insert({
        user_id: user.id,
        conversation_id: conversationId,
        role: "assistant",
        content: data.reply,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);

      const { data: currentConversation } = await supabase
        .from("conversations")
        .select("title")
        .eq("id", conversationId)
        .single();

      if (currentConversation?.title === "Nova conversa") {
        await supabase
          .from("conversations")
          .update({
            title:
              userMessage.length > 40
                ? `${userMessage.slice(0, 40)}...`
                : userMessage,
          })
          .eq("id", conversationId);

        await loadConversations(user.id);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ocorreu um problema ao conectar com o Conselheiro da Fé. Tente novamente em alguns instantes.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#F5F1EA] flex">
        <aside className="w-80 bg-white border-r border-[#E8E1D4] p-5 hidden md:flex flex-col">
          <h1 className="text-2xl font-semibold text-[#1E2A38] mb-6">
            Conselheiro da Fé
          </h1>

          <button
            onClick={handleNewConversation}
            className="bg-[#C8A96B] hover:bg-[#B89555] transition-all duration-300 text-white py-3 rounded-2xl shadow mb-6"
          >
            Nova conversa
          </button>

          <div className="flex flex-col gap-3 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition ${
                  conversationId === conversation.id
                    ? "bg-[#EFE6D7]"
                    : "hover:bg-[#F8F5EF]"
                }`}
              >
                <button
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`flex-1 text-left ${
                    conversationId === conversation.id
                      ? "text-[#1E2A38] font-semibold"
                      : "text-[#4A5565]"
                  }`}
                >
                  {conversation.title}
                </button>

                <button
                  onClick={() => {
                    setEditingConversationId(conversation.id);
                    setNewConversationTitle(conversation.title);
                  }}
                  className="text-[#9CA3AF] hover:text-[#1E2A38] transition text-sm"
                  title="Renomear conversa"
                >
                  ✎
                </button>

                <button
                  onClick={() => handleDeleteConversation(conversation.id)}
                  className="text-[#9CA3AF] hover:text-red-500 transition"
                  title="Apagar conversa"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          <header className="bg-white border-b border-[#E8E1D4] px-4 md:px-6 py-4 md:py-5 shadow-sm">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center min-w-0">
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="md:hidden bg-[#C8A96B] text-white px-4 py-2 rounded-xl mr-3 shrink-0"
                >
                  Menu
                </button>

                <div className="min-w-0">
                  <h2 className="text-2xl md:text-3xl font-semibold text-[#1E2A38] truncate">
                    Conselheiro da Fé
                  </h2>

                  <p className="text-[#6B7280] mt-1 text-sm md:text-base hidden sm:block">
                    Um espaço de acolhimento, reflexão e escuta.
                  </p>
                </div>
              </div>

              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-[#E8DDC8] hover:bg-[#E2D4BB] transition px-5 py-3 rounded-2xl text-[#1E2A38] font-semibold shadow-sm"
                >
                  {userName || "Minha Conta"}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-[#ECE4D7] overflow-hidden z-50">
                    <button
                      onClick={() => {
                        window.location.href = "/plans";
                      }}
                      className="w-full text-left px-5 py-4 hover:bg-[#F8F5EF] transition text-[#1E2A38]"
                    >
                      Meu plano
                    </button>

                    <button
                      onClick={() => {
                        window.location.href = "/settings";
                      }}
                      className="w-full text-left px-5 py-4 hover:bg-[#F8F5EF] transition text-[#1E2A38]"
                    >
                      Configurações
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-4 hover:bg-red-50 transition text-red-500"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6 md:py-8">
            <div className="max-w-4xl mx-auto flex flex-col gap-5 md:gap-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] md:max-w-[80%] rounded-3xl px-5 md:px-6 py-4 md:py-5 shadow-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#C8A96B] text-white"
                        : "bg-white text-[#1E2A38] border border-[#ECE4D7]"
                    }`}
                  >
                    <div>
                      <p>{msg.content}</p>

                      {msg.limitReached && (
                        <button
                          onClick={() => {
                            window.location.href = "/plans";
                          }}
                          className="mt-5 bg-[#C8A96B] hover:bg-[#B89555] transition-all duration-300 text-white px-6 py-3 rounded-2xl shadow"
                        >
                          Ver planos
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#ECE4D7] rounded-3xl px-6 py-5 text-[#4A5565] shadow-sm">
                    O Conselheiro está refletindo...
                  </div>
                </div>
              )}
            </div>
          </div>

          <footer className="bg-white border-t border-[#E8E1D4] px-3 md:px-4 py-4 md:py-5">
            <div className="max-w-4xl mx-auto flex gap-3 md:gap-4">
              <input
                type="text"
                placeholder="Compartilhe o que está em seu coração..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className="flex-1 border border-[#DDD6C8] rounded-2xl px-4 md:px-5 py-4 outline-none focus:border-[#C8A96B] bg-[#FAF8F4] min-w-0"
              />

              <button
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-[#C8A96B] hover:bg-[#B89555] disabled:opacity-50 transition-all duration-300 text-white px-5 md:px-8 rounded-2xl shadow"
              >
                Enviar
              </button>
            </div>
          </footer>
        </section>

        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 bg-black/40 md:hidden">
            <div className="h-full w-80 max-w-[85%] bg-white p-5 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-[#1E2A38]">
                  Conversas
                </h2>

                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="text-3xl text-[#4A5565]"
                >
                  ×
                </button>
              </div>

              <button
                onClick={() => {
                  handleNewConversation();
                  setShowMobileSidebar(false);
                }}
                className="w-full bg-[#C8A96B] hover:bg-[#B89555] transition-all duration-300 text-white py-3 rounded-2xl shadow mb-6"
              >
                Nova conversa
              </button>

              <div className="flex flex-col gap-3 overflow-y-auto flex-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      handleSelectConversation(conversation.id);
                      setShowMobileSidebar(false);
                    }}
                    className={`text-left px-4 py-3 rounded-2xl transition ${
                      conversationId === conversation.id
                        ? "bg-[#EFE6D7] text-[#1E2A38] font-semibold"
                        : "hover:bg-[#F8F5EF] text-[#4A5565]"
                    }`}
                  >
                    {conversation.title}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#E8E1D4] mt-6 pt-6 flex flex-col gap-4">
                <button
                  onClick={() => {
                    window.location.href = "/plans";
                  }}
                  className="text-left text-[#1E2A38]"
                >
                  Meu plano
                </button>

                <button
                  onClick={() => {
                    window.location.href = "/settings";
                  }}
                  className="text-left text-[#1E2A38]"
                >
                  Configurações
                </button>

                <button onClick={handleLogout} className="text-left text-red-500">
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}

        {editingConversationId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-semibold text-[#1E2A38] mb-6">
                Renomear conversa
              </h2>

              <input
                type="text"
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                className="w-full border border-[#DDD6C8] rounded-2xl px-5 py-4 outline-none focus:border-[#C8A96B] mb-6"
              />

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setEditingConversationId(null);
                    setNewConversationTitle("");
                  }}
                  className="px-5 py-3 rounded-2xl border border-[#DDD6C8]"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleRenameConversation}
                  className="bg-[#C8A96B] hover:bg-[#B89555] transition-all duration-300 text-white px-6 py-3 rounded-2xl"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}