"use client";

import type { ProcessingSettings } from "@/lib/api";

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onChange: (settings: ProcessingSettings) => void;
}

const features = [
  {
    key: "cut_silences" as const,
    icon: "✂️",
    label: "Cortar silêncios",
    description: "Remove pausas, fillers e repetições",
  },
  {
    key: "remove_noise" as const,
    icon: "🔊",
    label: "Remover ruído",
    description: "Limpa ruído de fundo (AC, ventilador)",
  },
  {
    key: "isolate_voice" as const,
    icon: "🎤",
    label: "Isolar voz",
    description: "Extrai apenas a fala (IA)",
  },
];

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const nothingSelected =
    !settings.cut_silences && !settings.remove_noise && !settings.isolate_voice;

  return (
    <div className="space-y-6 rounded-2xl bg-surface p-6 ring-1 ring-foreground/5">
      <h3 className="text-lg font-semibold">O que você quer fazer?</h3>

      {/* Feature toggle cards */}
      <div className="grid grid-cols-3 gap-3">
        {features.map((feat) => {
          const active = settings[feat.key];
          return (
            <button
              key={feat.key}
              onClick={() => onChange({ ...settings, [feat.key]: !active })}
              className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all ring-1 ${
                active
                  ? "bg-primary/10 ring-primary text-primary"
                  : "ring-foreground/5 hover:ring-foreground/10 hover:bg-surface"
              }`}
            >
              <span className="text-2xl">{feat.icon}</span>
              <span className="text-sm font-semibold">{feat.label}</span>
              <span className="text-xs text-muted">{feat.description}</span>
            </button>
          );
        })}
      </div>

      {nothingSelected && (
        <p className="text-center text-sm text-red-500">
          Selecione pelo menos uma opção
        </p>
      )}

      {/* ── Configurações de corte ── */}
      {settings.cut_silences && (
        <div className="space-y-4 border-t border-foreground/5 pt-5">
          <h4 className="text-sm font-semibold text-muted uppercase tracking-wider">
            ✂️ Configurações de corte
          </h4>

          <div>
            <label className="flex items-center justify-between text-sm">
              <span>Sensibilidade do silêncio</span>
              <span className="font-mono text-muted">
                {settings.silence_threshold_db} dB
              </span>
            </label>
            <input
              type="range"
              min={-60}
              max={-10}
              step={1}
              value={settings.silence_threshold_db}
              onChange={(e) =>
                onChange({
                  ...settings,
                  silence_threshold_db: Number(e.target.value),
                })
              }
              className="mt-2 w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>Mais sensível</span>
              <span>Menos sensível</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm">
              <span>Duração mínima do silêncio</span>
              <span className="font-mono text-muted">
                {settings.min_silence_duration}s
              </span>
            </label>
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.1}
              value={settings.min_silence_duration}
              onChange={(e) =>
                onChange({
                  ...settings,
                  min_silence_duration: Number(e.target.value),
                })
              }
              className="mt-2 w-full accent-primary"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={settings.detect_fillers}
                onChange={(e) =>
                  onChange({ ...settings, detect_fillers: e.target.checked })
                }
                className="h-4 w-4 accent-primary"
              />
              <span>Detectar filler words (éé, hmm, ann...)</span>
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={settings.detect_repetitions}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    detect_repetitions: e.target.checked,
                  })
                }
                className="h-4 w-4 accent-primary"
              />
              <span>Detectar repetições</span>
            </label>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm">
              <span>Padding entre cortes</span>
              <span className="font-mono text-muted">
                {settings.padding_ms}ms
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={settings.padding_ms}
              onChange={(e) =>
                onChange({ ...settings, padding_ms: Number(e.target.value) })
              }
              className="mt-2 w-full accent-primary"
            />
          </div>
        </div>
      )}

      {/* ── Configurações de ruído ── */}
      {settings.remove_noise && (
        <div className="space-y-4 border-t border-foreground/5 pt-5">
          <h4 className="text-sm font-semibold text-muted uppercase tracking-wider">
            🔊 Redução de ruído
          </h4>

          <div>
            <label className="flex items-center justify-between text-sm">
              <span>Intensidade da redução</span>
              <span className="font-mono text-muted">
                {Math.round(settings.noise_reduction_strength * 100)}%
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.noise_reduction_strength}
              onChange={(e) =>
                onChange({
                  ...settings,
                  noise_reduction_strength: Number(e.target.value),
                })
              }
              className="mt-2 w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>Leve</span>
              <span>Agressivo</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Info isolamento de voz ── */}
      {settings.isolate_voice && (
        <div className="space-y-2 border-t border-foreground/5 pt-5">
          <h4 className="text-sm font-semibold text-muted uppercase tracking-wider">
            🎤 Isolamento de voz
          </h4>
          <p className="text-sm text-muted">
            Usa IA (Demucs) para separar a voz de música, TV, trânsito e outros
            sons. Processamento mais lento (~1.5x a duração do vídeo).
          </p>
        </div>
      )}
    </div>
  );
}
