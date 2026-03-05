import Link from "next/link";

export function CTA() {
  return (
    <section className="bg-primary px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Pronto para editar?
        </h2>
        <p className="mt-4 text-lg text-violet-100">
          Envie seu vídeo e receba de volta sem pausas, sem hesitações, sem
          repetições. Grátis.
        </p>
        <Link
          href="/editor"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-sm hover:bg-violet-50 transition-colors"
        >
          Começar agora
        </Link>
      </div>
    </section>
  );
}
