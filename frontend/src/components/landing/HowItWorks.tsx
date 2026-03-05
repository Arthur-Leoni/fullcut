const steps = [
  {
    number: "1",
    title: "Envie seu vídeo",
    description: "Faça upload do seu vídeo em qualquer formato (MP4, MOV, WebM, MKV).",
  },
  {
    number: "2",
    title: "Processamento automático",
    description:
      "Nossa IA detecta silêncios, filler words e repetições automaticamente.",
  },
  {
    number: "3",
    title: "Baixe o resultado",
    description: "Seu vídeo editado, sem pausas e pronto para publicar.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Como funciona
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
