import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F5F1EA] text-[#1E2A38]">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#E7DFD1]/80 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl md:text-3xl font-semibold tracking-wide">
            Conselheiro da Fé
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/auth"
              className="flex h-11 items-center justify-center rounded-full px-5 text-[#1E2A38] transition hover:bg-[#F5F1EA]"
            >
              Entrar
            </Link>

            <Link
              href="/auth"
              className="flex h-11 items-center justify-center rounded-full bg-[#C8A96B] px-6 font-semibold text-white shadow-md transition hover:bg-[#B89555]"
            >
              Criar Conta
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative px-6 pt-40 pb-24 text-center">
        <div className="absolute left-1/2 top-20 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#EAD7A8]/50 blur-3xl" />
        <div className="absolute right-[-120px] top-40 -z-10 h-[360px] w-[360px] rounded-full bg-[#D9E4EF]/70 blur-3xl" />
        <div className="absolute left-[-120px] bottom-0 -z-10 h-[360px] w-[360px] rounded-full bg-[#F1E2C4]/80 blur-3xl" />

        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#E3D6BF] bg-white/70 px-5 py-2 text-sm font-bold text-[#1E2A38] shadow-sm backdrop-blur">
          <span>Escuta</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#C8A96B]" />
          <span>Fé</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#C8A96B]" />
          <span>Acolhimento</span>
        </div>

        <h1 className="mx-auto mb-8 max-w-6xl text-5xl font-semibold leading-tight md:text-7xl">
          Um lugar sereno para conversar quando o coração precisa de direção.
        </h1>

        <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-[#4A5565] md:text-2xl">
          Converse com o Conselheiro da Fé, uma IA criada para ouvir você com
          respeito, acolhimento e reflexões alinhadas à sua jornada espiritual.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <Link
            href="/auth"
            className="rounded-full bg-[#C8A96B] px-9 py-4 text-lg font-semibold text-white shadow-xl transition hover:bg-[#B89555]"
          >
            Começar Agora
          </Link>

          <Link
            href="/plans"
            className="rounded-full border border-[#C8A96B] bg-white/60 px-9 py-4 text-lg font-semibold text-[#8A6A35] shadow-sm transition hover:bg-[#EFE6D7]"
          >
            Conhecer Planos
          </Link>
        </div>

        <div className="mx-auto mt-20 grid max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-[#EEE7DA] bg-white/80 p-8 text-left shadow-xl backdrop-blur">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE6D7] text-2xl">
              ✦
            </div>
            <h3 className="mb-4 text-2xl font-semibold">Escuta sem julgamentos</h3>
            <p className="leading-relaxed text-[#4A5565]">
              Um espaço reservado para falar sobre angústias, dúvidas, decisões,
              família, fé e momentos difíceis.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#EEE7DA] bg-white/80 p-8 text-left shadow-xl backdrop-blur">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE6D7] text-2xl">
              ✧
            </div>
            <h3 className="mb-4 text-2xl font-semibold">Direção pela fé</h3>
            <p className="leading-relaxed text-[#4A5565]">
              O Conselheiro considera sua crença para oferecer reflexões mais
              respeitosas, humanas e espiritualmente coerentes.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#EEE7DA] bg-white/80 p-8 text-left shadow-xl backdrop-blur">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE6D7] text-2xl">
              ☼
            </div>
            <h3 className="mb-4 text-2xl font-semibold">Memória emocional</h3>
            <p className="leading-relaxed text-[#4A5565]">
              No plano Memória, o Conselheiro acompanha sua jornada e oferece
              respostas com continuidade.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
          <div>
            <span className="mb-5 inline-block rounded-full bg-[#E8DDC8] px-4 py-2 text-sm font-bold text-[#1E2A38]">
              Apoio para momentos reais
            </span>

            <h2 className="mb-6 text-4xl font-semibold leading-tight md:text-6xl">
              Quando faltar clareza, você pode começar com uma conversa.
            </h2>

            <p className="mb-8 text-xl leading-relaxed text-[#4A5565]">
              O Conselheiro da Fé foi pensado para pessoas que desejam ser
              ouvidas com calma, refletir sobre suas emoções e encontrar apoio
              espiritual sem julgamentos.
            </p>

            <Link
              href="/auth"
              className="inline-flex rounded-full bg-[#1E2A38] px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              Criar minha conta
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-[#EAD7A8]/40 blur-2xl" />

            <div className="rounded-[2rem] border border-[#EEE7DA] bg-white p-6 shadow-2xl">
              <div className="mb-5 rounded-3xl bg-[#F5F1EA] p-6 text-[#1E2A38]">
                “Estou me sentindo perdido e precisava conversar com alguém.”
              </div>

              <div className="rounded-3xl bg-[#1E2A38] p-6 text-white">
                “Estou aqui com você. Vamos olhar para este momento com
                serenidade. Você não precisa carregar tudo sozinho.”
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm text-[#6B7280]">
                <div className="rounded-2xl bg-[#FAF8F4] p-4">Serenidade</div>
                <div className="rounded-2xl bg-[#FAF8F4] p-4">Respeito</div>
                <div className="rounded-2xl bg-[#FAF8F4] p-4">Fé</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EFE6D7] px-6 py-24 text-center">
        <h2 className="mx-auto mb-8 max-w-4xl text-4xl font-semibold md:text-6xl">
          Apoio espiritual, com responsabilidade.
        </h2>

        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-[#4A5565]">
          O Conselheiro da Fé oferece apoio conversacional e espiritual. Ele não
          substitui médicos, psicólogos, terapeutas ou líderes religiosos.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="mb-6 text-4xl font-semibold md:text-6xl">
            Escolha como deseja continuar
          </h2>
          <p className="text-xl text-[#4A5565]">
            Comece gratuitamente e avance quando sentir que faz sentido.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-[2rem] border border-[#E8E1D4] bg-white p-8 shadow-lg">
            <h3 className="mb-4 text-3xl font-semibold">Essencial</h3>
            <p className="mb-8 text-[#4A5565]">Conversas ilimitadas por texto.</p>
            <strong className="text-5xl">R$19,90</strong>
          </div>

          <div className="relative rounded-[2rem] bg-[#1E2A38] p-8 text-white shadow-2xl">
            <span className="absolute right-5 top-5 rounded-full bg-[#C8A96B] px-4 py-1 text-sm font-bold">
              Popular
            </span>
            <h3 className="mb-4 text-3xl font-semibold">Voz</h3>
            <p className="mb-8 text-[#D1D5DB]">Uma experiência mais humana.</p>
            <strong className="text-5xl">R$29,90</strong>
          </div>

          <div className="rounded-[2rem] border-2 border-[#C8A96B] bg-white p-8 shadow-xl">
            <h3 className="mb-4 text-3xl font-semibold">Memória</h3>
            <p className="mb-8 text-[#4A5565]">
              Continuidade emocional e espiritual.
            </p>
            <strong className="text-5xl">R$49,90</strong>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/plans"
            className="inline-flex rounded-full bg-[#C8A96B] px-9 py-4 text-lg font-semibold text-white shadow-xl transition hover:bg-[#B89555]"
          >
            Ver todos os planos
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#E7DFD1] bg-white px-6 py-10 text-center text-[#6B7280]">
        <p>Conselheiro da Fé © 2026</p>
        <p className="mx-auto mt-3 max-w-2xl text-sm">
          Apoio espiritual e conversacional. Não substitui acompanhamento
          médico, psicológico, terapêutico ou religioso.
        </p>
      </footer>
    </main>
  );
}