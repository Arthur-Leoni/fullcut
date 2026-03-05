"use client";

import type { ProcessingSettings } from "@/lib/api";

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onChange: (settings: ProcessingSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <div className="space-y-6 rounded-2xl bg-surface p-6 ring-1 ring-foreground/5">
      <h3 className="text-lg font-semibold">Configurações</h3>

      <div>
        <label className="flex items-center justify-between text-sm">
          <span>Sensibilidade do silêncio</span>
          <span className="font-mono text-muted">{settings.silence_threshold_db} dB</span>
        </label>
        <input
          type="range"
          min={-60}
          max={-10}
          step={1}
          value={settings.silence_threshold_db}
          onChange={(e) =>
            onChange({ ...settings, silence_threshold_db: Number(e.target.value) })
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
          <span className="font-mono text-muted">{settings.min_silence_duration}s</span>
        </label>
        <input
          type="range"
          min={0.2}
          max={3}
          step={0.1}
          value={settings.min_silence_duration}
          onChange={(e) =>
            onChange({ ...settings, min_silence_duration: Number(e.target.value) })
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
              onChange({ ...settings, detect_repetitions: e.target.checked })
            }
            className="h-4 w-4 accent-primary"
          />
          <span>Detectar repetições</span>
        </label>
      </div>

      <div>
        <label className="flex items-center justify-between text-sm">
          <span>Padding entre cortes</span>
          <span className="font-mono text-muted">{settings.padding_ms}ms</span>
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
  );
}
