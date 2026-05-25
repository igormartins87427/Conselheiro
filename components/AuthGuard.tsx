"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/";
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F1EA] flex items-center justify-center">
        <div className="text-[#1E2A38] text-xl">
          Carregando...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}