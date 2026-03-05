"use client";

import type { ProcessingSettings } from "@/lib/api";

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onChange: (settings: ProcessingSettings) => void;
}

const modes = [
  {
    value: "cut_only" as const,
    icon: "✂️",
    label: "Cortar silêncios",
    description: "Remove pausas e tempo morto",
  },
  {
    value: "denoise_only" as const,
    icon: "🔊",
    label: "Remover ruído",
    description: "Limpa ruído de fundo (AC, ventilador)",
  },
  {
    value: "both" as const,
    icon: "✨",
    label: "Ambos",
    description: "Corta e remove ruído",
  },
  {
    value: "voice_isolation" as const,
    icon: "🎤",
    label: "Isolar voz",
    description: "Extrai apenas a fala (IA)",
  },
];

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const showCutSettings = settings.processing_mode === "cut_only" || settings.processing_mode === "both";
  const showDenoiseSettings = settings.processing_mode === "denoise_only" || settings.processing_mode === "both";

  return (
    <div className="space-y-6 rounded-2xl bg-surface p-6 ring-1 ring-foreground/5">
      <h3 className="text-lg font-semibold">O que você quer fazer?</h3>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() =>
              onChange({ ...settings, processing_mode: mode.value })
            }
            className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all ring-1 ${
              settings.processing_mode === mode.value
                ? "bg-primary/10 ring-primary text-primary"
                : "ring-foreground/5 hover:ring-foreground/10 hover:bg-surface"
            }`}
          >
            <span className="text-2xl">{mode.icon}</span>
            <span className="text-sm font-semibold">{mode.label}</span>
            <span className="text-xs text-muted">{mode.description}</span>
          </button>
        ))}
      </div>

      {/* Noise reduction strength */}
      {showDenoiseSettings && (
        <div className="rounded-xl bg-background p-4 ring-1 ring-foreground/5">
          <label className="flex items-center justify-between text-sm">
            <span>Intensidade da redução de ruído</span>
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
      )}

      {/* Cut settings (hidden in denoise-only mode) */}
      {showCutSettings && (
        <>
          <div className="border-t border-foreground/5 pt-4">
            <h4 className="mb-4 text-sm font-semibold text-muted uppercase tracking-wider">
              Configurações de corte
            </h4>
          </div>

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
        </>
      )}
    </div>
  );
}
