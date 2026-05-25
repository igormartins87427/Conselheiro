"use client";

import { supabase } from "../../lib/supabase";

export default function LoginButton() {

  async function handleLogin() {

    await supabase.auth.signInWithOAuth({
      provider: "google",
    });

  }

  return (
    <button
      onClick={handleLogin}
      className="bg-[#C8A96B] hover:bg-[#B89555] transition-all duration-300 text-white px-5 py-2 rounded-full shadow"
    >
      Entrar com Google
    </button>
  );
}