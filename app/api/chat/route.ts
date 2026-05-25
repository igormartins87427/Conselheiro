import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;
    const userId = body.userId;

    let plan = "free";
    let religion = "";
    let memorySummary = "";
    let previousMessages: { role: "user" | "assistant"; content: string }[] =
      [];
    let messageCount = 0;
    let dailyMessages = 0;
    let lastMessageReset = "";
    let subscriptionStatus = "inactive";
    let subscriptionExpiresAt = "";

    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "plan, religion, message_count, daily_messages, last_message_reset, subscription_status, subscription_expires_at"
        )
        .eq("id", userId)
        .single();

      if (profile) {
        plan = profile.plan || "free";
        religion = profile.religion || "";
        messageCount = profile.message_count || 0;
        dailyMessages = profile.daily_messages || 0;
        lastMessageReset = profile.last_message_reset || "";
        subscriptionStatus = profile.subscription_status || "inactive";
        subscriptionExpiresAt = profile.subscription_expires_at || "";
      }
    }

    const isMemoryPlan = plan === "memory";

    const now = new Date();

    if (
      userId &&
      plan !== "free" &&
      (subscriptionStatus !== "active" ||
        !subscriptionExpiresAt ||
        new Date(subscriptionExpiresAt) < now)
    ) {
      await supabase
        .from("profiles")
        .update({
          plan: "free",
          subscription_status: "expired",
        })
        .eq("id", userId);

      plan = "free";
    }

    const today = new Date().toDateString();
    const lastResetDay = lastMessageReset
      ? new Date(lastMessageReset).toDateString()
      : "";

    if (userId && today !== lastResetDay) {
      dailyMessages = 0;

      await supabase
        .from("profiles")
        .update({
          daily_messages: 0,
          last_message_reset: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    if (plan === "free" && dailyMessages >= 1) {
      return Response.json({
        reply:
          "Seu momento gratuito com o Conselheiro da Fé foi concluído. Para continuar recebendo acolhimento, reflexão e orientação espiritual, escolha um plano e siga sua jornada conosco.",
        limitReached: true,
      });
    }

    const isActiveMemoryPlan = plan === "memory";

    if (isActiveMemoryPlan && userId) {
      const { data: memoryData } = await supabase
        .from("user_memories")
        .select("summary")
        .eq("user_id", userId)
        .maybeSingle();

      if (memoryData?.summary) {
        memorySummary = memoryData.summary;
      }

      const { data: history } = await supabase
        .from("messages")
        .select("role, content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (history) {
        previousMessages = history.reverse().map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
      }
    }

    const systemPrompt = `
Você é o Conselheiro da Fé.

Religião do usuário: ${religion || "não informada"}.
Plano do usuário: ${plan}.

Seu objetivo é oferecer acolhimento, apoio emocional e reflexão espiritual.

Você deve:
- ser acolhedor
- ser respeitoso
- nunca julgar
- incentivar esperança
- falar com serenidade
- respeitar a religião informada pelo usuário
- não misturar religiões sem necessidade
- evitar promessas de cura, milagres ou resultados garantidos
- incentivar ajuda humana qualificada quando houver sofrimento intenso

Você não substitui:
- médicos
- psicólogos
- terapeutas
- líderes religiosos

Memória do usuário:
${memorySummary || "Nenhuma memória registrada ainda."}

${
  isActiveMemoryPlan
    ? "Este usuário possui memória ativa. Considere o histórico emocional e espiritual dele durante a conversa."
    : "Este usuário não possui memória ativa. Responda apenas com base na mensagem atual."
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...previousMessages,
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content || "";

    if (userId) {
      const newCount = messageCount + 1;

      await supabase
        .from("profiles")
        .update({
          message_count: newCount,
          daily_messages: dailyMessages + 1,
        })
        .eq("id", userId);

      if (isActiveMemoryPlan && newCount % 10 === 0) {
        const { data: recentMessages } = await supabase
          .from("messages")
          .select("role, content")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(30);

        const conversationText =
          recentMessages
            ?.reverse()
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join("\n") || "";

        const memoryCompletion = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: `
Você é um sistema de memória emocional e espiritual.

Crie um resumo curto e útil sobre o usuário.
Não invente informações.
Não registre dados sensíveis desnecessários.
Foque em padrões emocionais, preferências de acolhimento, religião informada, dificuldades recorrentes e objetivos espirituais.

O resumo deve ajudar o Conselheiro da Fé a responder melhor no futuro.
              `,
            },
            {
              role: "user",
              content: `
Memória atual:
${memorySummary || "Nenhuma memória registrada."}

Conversa recente:
${conversationText}
              `,
            },
          ],
        });

        const newSummary =
          memoryCompletion.choices[0].message.content || memorySummary;

        const { data: existingMemory } = await supabase
          .from("user_memories")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingMemory) {
          const { error: updateMemoryError } = await supabase
            .from("user_memories")
            .update({
              summary: newSummary,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (updateMemoryError) {
            console.log("ERRO AO ATUALIZAR MEMÓRIA:", updateMemoryError);
          }
        } else {
          const { error: insertMemoryError } = await supabase
            .from("user_memories")
            .insert({
              user_id: userId,
              summary: newSummary,
            });

          if (insertMemoryError) {
            console.log("ERRO AO CRIAR MEMÓRIA:", insertMemoryError);
          }
        }
      }
    }

    return Response.json({
      reply,
    });
  } catch (error) {
    console.log(error);

    return Response.json({
      reply:
        "O Conselheiro da Fé está temporariamente indisponível no momento. Tente novamente mais tarde.",
    });
  }
}