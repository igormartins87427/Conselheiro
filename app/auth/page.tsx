"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/onboarding");
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("E-mail ou senha incorretos.");
      return;
    }

    router.push("/chat");
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  return (
    <main className="min-h-screen bg-[#F5F1EA] flex items-center justify-center px-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-10 border border-[#EEE7DA]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-[#1E2A38] mb-4">
            Conselheiro da Fé
          </h1>

          <p className="text-[#4A5565] leading-relaxed">
            {mode === "login"
              ? "Entre na sua conta para continuar sua jornada."
              : "Crie sua conta e encontre um espaço de acolhimento, reflexão e apoio espiritual."}
          </p>
        </div>

        <div className="grid grid-cols-2 bg-[#F5F1EA] rounded-2xl p-1 mb-8">
          <button
            onClick={() => setMode("login")}
            className={`py-3 rounded-xl transition ${
              mode === "login"
                ? "bg-white shadow text-[#1E2A38] font-semibold"
                : "text-[#6B7280]"
            }`}
          >
            Entrar
          </button>

          <button
            onClick={() => setMode("signup")}
            className={`py-3 rounded-xl transition ${
              mode === "signup"
                ? "bg-white shadow text-[#1E2A38] font-semibold"
                : "text-[#6B7280]"
            }`}
          >
            Criar Conta
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#DDD6C8] rounded-2xl px-5 py-4 outline-none focus:border-[#C8A96B]"
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#DDD6C8] rounded-2xl px-5 py-4 outline-none focus:border-[#C8A96B]"
          />

          <button
            onClick={mode === "login" ? handleLogin : handleSignup}
            className="bg-[#C8A96B] hover:bg-[#B89555] transition-all duration-300 text-white py-4 rounded-2xl shadow"
          >
            {mode === "login" ? "Entrar" : "Criar Conta"}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-[#E5DED1] flex-1" />
            <span className="text-sm text-[#7A7A7A]">ou</span>
            <div className="h-px bg-[#E5DED1] flex-1" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="border border-[#DDD6C8] hover:bg-[#F8F5EF] transition-all duration-300 py-4 rounded-2xl"
          >
            Continuar com Google
          </button>
        </div>
      </div>
    </main>
  );
}