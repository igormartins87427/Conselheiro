"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PlansPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, subscription_status, subscription_expires_at")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCurrentPlan(profile.plan || "free");
        setSubscriptionStatus(profile.subscription_status || "inactive");
        setSubscriptionExpiresAt(profile.subscription_expires_at || null);
      }
    }

    loadProfile();
  }, []);

  async function handleSelectPlan(plan: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const response = await fetch("/api/mercadopago/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan,
        userId: user.id,
      }),
    });

    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    if (!data.url) {
      alert("Checkout não retornou uma URL.");
      return;
    }

    window.location.href = data.url;
  }

  function getPlanName(plan: string) {
    if (plan === "essential") return "Essencial";
    if (plan === "voice") return "Voz";
    if (plan === "memory") return "Memória";
    return "Gratuito";
  }

  function getStatusName(status: string) {
    if (status === "active") return "Ativo";
    if (status === "expired") return "Expirado";
    return "Inativo";
  }

  return (
    <main className="min-h-screen bg-[#F5F1EA] px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-semibold text-[#1E2A38] mb-5">
            Escolha seu caminho
          </h1>

          <p className="text-[#4A5565] text-xl max-w-3xl leading-relaxed">
            Tenha acesso ao Conselheiro da Fé da forma que melhor acompanha
            sua jornada espiritual e emocional.
          </p>
        </div>

        {currentPlan !== "free" && (
          <div className="mb-10 rounded-3xl border border-[#E8E1D4] bg-white p-6 shadow-sm text-[#1E2A38]">
            <p>
              Seu plano atual: <strong>{getPlanName(currentPlan)}</strong>
            </p>

            <p className="mt-2 text-[#4A5565]">
              Status: <strong>{getStatusName(subscriptionStatus)}</strong>
            </p>

            {subscriptionExpiresAt && (
              <p className="mt-2 text-[#4A5565]">
                Válido até:{" "}
                <strong>
                  {new Date(subscriptionExpiresAt).toLocaleDateString("pt-BR")}
                </strong>
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl border border-[#E8E1D4] p-10 shadow-sm">
            <h2 className="text-3xl font-semibold text-[#1E2A38] mb-4">
              Essencial
            </h2>

            <p className="text-[#4A5565] mb-8">
              Conversas ilimitadas com apoio espiritual acolhedor.
            </p>

            <div className="text-5xl font-semibold text-[#1E2A38] mb-10">
              R$19,90 <span className="text-lg text-[#6B7280]">/mês</span>
            </div>

            <ul className="flex flex-col gap-4 text-[#4A5565] mb-10">
              <li>• Conversas ilimitadas</li>
              <li>• Apoio espiritual personalizado</li>
              <li>• Reflexões alinhadas à sua fé</li>
              <li>• Histórico temporário</li>
            </ul>

            <button
              type="button"
              onClick={() => handleSelectPlan("essential")}
              className="w-full bg-[#1E2A38] hover:opacity-90 transition-all duration-300 text-white py-4 rounded-2xl"
            >
              {currentPlan === "essential" ? "Plano atual" : "Assinar Plano"}
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8E1D4] p-10 shadow-sm">
            <h2 className="text-3xl font-semibold text-[#1E2A38] mb-4">
              Voz
            </h2>

            <p className="text-[#4A5565] mb-8">
              Converse com o Conselheiro da Fé por voz.
            </p>

            <div className="text-5xl font-semibold text-[#1E2A38] mb-10">
              R$29,90 <span className="text-lg text-[#6B7280]">/mês</span>
            </div>

            <ul className="flex flex-col gap-4 text-[#4A5565] mb-10">
              <li>• Tudo do plano Essencial</li>
              <li>• Conversas por voz</li>
              <li>• Experiência mais humana</li>
              <li>• Respostas faladas</li>
            </ul>

            <button
              type="button"
              onClick={() => handleSelectPlan("voice")}
              className="w-full mt-6 bg-[#1E2A38] hover:opacity-90 transition-all duration-300 text-white py-4 rounded-2xl"
            >
              {currentPlan === "voice" ? "Plano atual" : "Assinar Plano"}
            </button>
          </div>

          <div className="bg-[#1E2A38] rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#C8A96B] text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
              Mais Popular
            </div>

            <h2 className="text-3xl font-semibold text-white mb-4">
              Memória
            </h2>

            <p className="text-[#D1D5DB] mb-8">
              Um Conselheiro que lembra da sua jornada.
            </p>

            <div className="text-5xl font-semibold text-white mb-10">
              R$49,90 <span className="text-lg text-[#D1D5DB]">/mês</span>
            </div>

            <ul className="flex flex-col gap-4 text-[#E5E7EB] mb-10">
              <li>• Tudo do plano Voz</li>
              <li>• Memória de longo prazo</li>
              <li>• Continuidade emocional</li>
              <li>• Histórico inteligente</li>
              <li>• Conversas contextualizadas</li>
            </ul>

            <button
              type="button"
              onClick={() => handleSelectPlan("memory")}
              className="w-full -mt-4 bg-[#C8A96B] hover:bg-[#B89555] transition-all duration-300 text-white py-4 rounded-2xl"
            >
              {currentPlan === "memory" ? "Plano atual" : "Assinar Plano"}
            </button>
          </div>
        </div>

        <div className="text-center mt-20">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/chat";
            }}
            className="text-[#1E2A38] hover:opacity-70 transition"
          >
            Voltar para o Conselheiro da Fé
          </button>
        </div>
      </div>
    </main>
  );
}