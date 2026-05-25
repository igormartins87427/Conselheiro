"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [religion, setReligion] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("name, age, religion, reason")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.name || "");
        setAge(data.age ? String(data.age) : "");
        setReligion(data.religion || "");
        setReason(data.reason || "");
      }
    }

    loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({
        name,
        age: Number(age),
        religion,
        reason,
      })
      .eq("id", user.id);

    setSaving(false);
    alert("Configurações salvas com sucesso.");
  }

  return (
    <main className="min-h-screen bg-[#F5F1EA] px-6 py-16">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-[#EEE7DA] p-10">
        <h1 className="text-4xl font-semibold text-[#1E2A38] mb-4">
          Configurações
        </h1>

        <p className="text-[#4A5565] mb-10">
          Atualize suas informações para que o Conselheiro da Fé possa oferecer
          uma experiência mais alinhada à sua jornada.
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
            placeholder="O que fez você buscar apoio?"
            rows={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-[#DDD6C8] rounded-2xl px-5 py-4 outline-none focus:border-[#C8A96B]"
          />

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => {
                window.location.href = "/chat";
              }}
              className="px-6 py-3 rounded-2xl border border-[#DDD6C8] text-[#1E2A38]"
            >
              Voltar
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#C8A96B] hover:bg-[#B89555] disabled:opacity-50 transition-all duration-300 text-white px-8 py-3 rounded-2xl shadow"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}