import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-100/50 to-transparent dark:from-violet-950/30" />
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Corte seus vídeos{" "}
          <span className="text-primary">automaticamente</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">
          Remova silêncios, pausas, &quot;ééés&quot; e repetições dos seus
          vídeos em um clique. Transforme conteúdo longo em vídeos curtos e
          dinâmicos.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/editor"
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
          >
            Experimentar agora
          </Link>
          <a
            href="#como-funciona"
            className="text-sm font-semibold leading-6 text-foreground"
          >
            Como funciona <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
