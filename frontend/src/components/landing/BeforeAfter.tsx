export function BeforeAfter() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Antes e depois
        </h2>
        <p className="mt-4 text-center text-muted">
          Veja como seu vídeo fica após o processamento
        </p>

        <div className="mt-12 space-y-8">
          {/* Before */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Antes</span>
              <span className="text-muted">5:30</span>
            </div>
            <div className="flex h-10 w-full overflow-hidden rounded-lg">
              <div className="bg-primary/80" style={{ width: "15%" }} />
              <div className="bg-red-300/60" style={{ width: "8%" }} />
              <div className="bg-primary/80" style={{ width: "20%" }} />
              <div className="bg-amber-300/60" style={{ width: "5%" }} />
              <div className="bg-primary/80" style={{ width: "12%" }} />
              <div className="bg-red-300/60" style={{ width: "10%" }} />
              <div className="bg-primary/80" style={{ width: "8%" }} />
              <div className="bg-orange-300/60" style={{ width: "4%" }} />
              <div className="bg-primary/80" style={{ width: "18%" }} />
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/80" />
                Conteúdo
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-300/60" />
                Silêncio
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-300/60" />
                Fillers
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-300/60" />
                Repetição
              </span>
            </div>
          </div>

          {/* After */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Depois</span>
              <span className="text-muted">3:45</span>
            </div>
            <div className="flex h-10 overflow-hidden rounded-lg" style={{ width: "73%" }}>
              <div className="w-full bg-primary" />
            </div>
            <p className="mt-2 text-xs text-muted">
              32% mais curto &mdash; só conteúdo relevante
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
