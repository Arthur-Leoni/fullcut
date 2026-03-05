"use client";

import type { ProcessingSettings } from "@/lib/api";

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onChange: (settings: ProcessingSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const nothingSelected =
    !settings.cut_silences && !settings.remove_noise && !settings.isolate_voice;

  return (
    <div className="space-y-4">
      {/* ── Cortar silêncios ── */}
      <div className="rounded-2xl bg-surface ring-1 ring-foreground/5">
        <button
          type="button"
          onClick={() =>
            onChange({ ...settings, cut_silences: !settings.cut_silences })
          }
          className={`flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all ring-1 ${
            settings.cut_silences
              ? "bg-primary/10 ring-primary"
              : "ring-foreground/5 hover:ring-foreground/10"
          }`}
        >
          <span className="text-2xl">✂️</span>
          <div className="flex-1">
            <span className="font-semibold">Cortar silêncios</span>
            <p className="text-xs text-muted">
              Remove pausas, filler words e repetições
            </p>
          </div>
          <div
            className={`h-5 w-9 rounded-full transition-colors ${
              settings.cut_silences ? "bg-primary" : "bg-foreground/10"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                settings.cut_silences ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {settings.cut_silences && (
          <div className="space-y-5 px-5 pb-5 pt-2">
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
      </div>

      {/* ── Remover ruído ── */}
      <div className="rounded-2xl bg-surface ring-1 ring-foreground/5">
        <button
          type="button"
          onClick={() =>
            onChange({ ...settings, remove_noise: !settings.remove_noise })
          }
          className={`flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all ring-1 ${
            settings.remove_noise
              ? "bg-primary/10 ring-primary"
              : "ring-foreground/5 hover:ring-foreground/10"
          }`}
        >
          <span className="text-2xl">🔊</span>
          <div className="flex-1">
            <span className="font-semibold">Remover ruído</span>
            <p className="text-xs text-muted">
              Limpa ruído constante (AC, ventilador, white noise)
            </p>
          </div>
          <div
            className={`h-5 w-9 rounded-full transition-colors ${
              settings.remove_noise ? "bg-primary" : "bg-foreground/10"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                settings.remove_noise ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {settings.remove_noise && (
          <div className="px-5 pb-5 pt-2">
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
        )}
      </div>

      {/* ── Isolar voz ── */}
      <div className="rounded-2xl bg-surface ring-1 ring-foreground/5">
        <button
          type="button"
          onClick={() =>
            onChange({ ...settings, isolate_voice: !settings.isolate_voice })
          }
          className={`flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all ring-1 ${
            settings.isolate_voice
              ? "bg-primary/10 ring-primary"
              : "ring-foreground/5 hover:ring-foreground/10"
          }`}
        >
          <span className="text-2xl">🎤</span>
          <div className="flex-1">
            <span className="font-semibold">Isolar voz</span>
            <p className="text-xs text-muted">
              IA que extrai apenas a fala, remove todo o resto
            </p>
          </div>
          <div
            className={`h-5 w-9 rounded-full transition-colors ${
              settings.isolate_voice ? "bg-primary" : "bg-foreground/10"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                settings.isolate_voice ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {settings.isolate_voice && (
          <div className="px-5 pb-5 pt-2">
            <p className="text-xs text-muted">
              Usa IA (Demucs) para separar a voz de música, TV, trânsito e
              outros sons. Processamento mais lento (~1.5x a duração do vídeo).
            </p>
          </div>
        )}
      </div>

      {nothingSelected && (
        <p className="text-center text-sm text-red-500">
          Selecione pelo menos uma opção
        </p>
      )}
    </div>
  );
}
