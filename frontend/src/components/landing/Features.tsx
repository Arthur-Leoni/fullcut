const features = [
  {
    title: "Remoção de silêncio",
    description:
      "Detecta e remove automaticamente pausas e momentos de silêncio que tornam o vídeo arrastado.",
    icon: "🔇",
  },
  {
    title: "Filler words",
    description:
      'Remove "éééés", "hmms", "anns" e outras hesitações que poluem seu conteúdo.',
    icon: "🗣️",
  },
  {
    title: "Repetições",
    description:
      "Identifica quando você repete a mesma frase e mantém apenas a melhor versão.",
    icon: "🔄",
  },
  {
    title: "Supressão de ruído",
    description:
      "Remove ruído de fundo como ar condicionado, ventilador e sons ambiente do seu vídeo.",
    icon: "🔊",
  },
  {
    title: "Isolamento de voz",
    description:
      "IA avançada que extrai apenas a fala, removendo música, TV, trânsito e qualquer outro som.",
    icon: "🎤",
  },
];

export function Features() {
  return (
    <section className="bg-surface px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Tudo que você precisa
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-background p-6 shadow-sm ring-1 ring-foreground/5"
            >
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
