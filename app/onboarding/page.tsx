"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function OnboardingPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [religion, setReligion] = useState("");
  const [reason, setReason] = useState("");

  async function handleContinue() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Usuário não encontrado.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .insert({email: user.email,
        id: user.id,
        name,
        age: Number(age),
        religion,
        reason,
      });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/chat");
  }

  return (
    <main className="min-h-screen bg-[#F5F1EA] flex items-center justify-center px-6">

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl p-10 border border-[#EEE7DA]">

        <h1 className="text-4xl font-semibold text-[#1E2A38] mb-3">
          Vamos conhecer você melhor
        </h1>

        <p className="text-[#4A5565] mb-10">
          Essas informações ajudarão o Conselheiro da Fé
          a oferecer conversas mais acolhedoras e alinhadas
          à sua jornada espiritual.
        </p>

        <div className="flex flex-col gap-5">

          <input
            type="text"
            placeholder="Como você gostaria de ser chamado?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#DDD6C8] rounded-2xl px-5 py-4 outline-none focus:border-[#C8A96B]"
          />

          <input
            type="number"
            placeholder="Sua idade"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full border border-[#DDD6C8] rounded-2xl px-5 py-4 outline-none focus:border-[#C8A96B]"
          />

          <select
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            className="w-full border border-[#DDD6C8] rounded-2xl px-5 py-4 outline-none focus:border-[#C8A96B]"
          >
            <option value="">Selecione sua religião</option>
            <option>Católica</option>
            <option>Evangélica</option>
            <option>Espírita</option>
            <option>Religião de matriz africana</option>
            <option>Outra</option>
          </select>

          <textarea
            placeholder="O que fez você buscar apoio hoje?"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-[#DDD6C8] rounded-2xl px-5 py-4 outline-none focus:border-[#C8A96B]"
          />

          <button
            onClick={handleContinue}
            className="bg-[#C8A96B] hover:bg-[#B89555] transition-all duration-300 text-white py-4 rounded-2xl shadow"
          >
            Continuar
          </button>

        </div>

      </div>

    </main>
  );
}