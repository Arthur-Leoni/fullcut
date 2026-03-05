# FullCut

Editor de vídeo automático que remove silêncios, pausas, filler words ("éééé", "hmm", "ann") e repetições dos seus vídeos em um clique.

## Demo

1. Faça upload de um vídeo
2. O sistema detecta e remove automaticamente tempo morto
3. Baixe o vídeo editado, pronto para publicar

**Resultado:** vídeos até 30-40% mais curtos, sem pausas ou hesitações.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 + TailwindCSS |
| Backend | Python 3.12 + FastAPI |
| Processamento de vídeo | FFmpeg |
| Transcrição / IA | OpenAI Whisper (modelo `base`) |
| Comunicação em tempo real | Server-Sent Events (SSE) |

---

## Pré-requisitos

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Python** 3.10+ ([download](https://www.python.org/downloads/))
- **FFmpeg** ([download](https://ffmpeg.org/download.html))

### Verificar instalação

```bash
node --version    # v18+
python --version  # 3.10+
ffmpeg -version   # qualquer versão recente
```

---

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/fullcut.git
cd fullcut
```

### 2. Backend (Python)

```bash
cd backend

# Criar ambiente virtual
python -m venv .venv

# Ativar ambiente virtual
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Instalar dependências
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

> **Nota:** Na primeira execução, o Whisper vai baixar o modelo `base` (~140MB). Isso acontece apenas uma vez.

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
```

### 4. Configurar variáveis de ambiente

**Backend** (`backend/.env`):

```env
WHISPER_MODEL=base
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=500
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe
CORS_ORIGINS=["http://localhost:3000"]
```

> Se o FFmpeg não estiver no PATH, use o caminho completo:
> `FFMPEG_PATH=C:\caminho\para\ffmpeg.exe`

**Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Iniciar o projeto

Abra **dois terminais**:

### Terminal 1 — Backend (porta 8000)

```bash
cd backend
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/Mac
uvicorn app.main:app --reload --port 8000
```

### Terminal 2 — Frontend (porta 3000)

```bash
cd frontend
npm run dev
```

### Acessar

- **Landing Page:** http://localhost:3000
- **Editor:** http://localhost:3000/editor
- **API Health:** http://localhost:8000/api/health

---

## Como funciona

```
Upload do vídeo
      │
      ▼
Extrair áudio (FFmpeg → WAV 16kHz mono)
      │
      ▼
Detectar silêncios (FFmpeg silencedetect)
      │
      ▼
Transcrever áudio (Whisper com word timestamps)
      │
      ├──▶ Detectar filler words (fuzzy matching)
      │
      ├──▶ Detectar repetições (sliding window)
      │
      ▼
Merge dos segmentos + aplicar padding
      │
      ▼
Cortar vídeo (FFmpeg segment + concat)
      │
      ▼
Download do vídeo editado
```

### Detecção

| Tipo | Método | Exemplo |
|------|--------|---------|
| Silêncio | FFmpeg `silencedetect` filter | Pausas > 0.5s |
| Filler words | Whisper + fuzzy match | "éééé", "hmm", "ann" |
| Repetições | Sliding window + SequenceMatcher | Frases repetidas consecutivas |

---

## Estrutura do projeto

```
fullcut/
├── frontend/                  # Next.js + TailwindCSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Landing Page
│   │   │   └── editor/
│   │   │       └── page.tsx   # Editor (upload → processing → result)
│   │   ├── components/
│   │   │   ├── landing/       # Hero, HowItWorks, Features, BeforeAfter, CTA
│   │   │   └── editor/        # UploadZone, ProcessingView, ResultView, Settings
│   │   ├── lib/api.ts         # Cliente HTTP
│   │   └── hooks/             # useJobProgress (SSE)
│   └── .env.local
│
├── backend/                   # Python FastAPI
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS
│   │   ├── config.py          # Settings via .env
│   │   ├── models.py          # Schemas Pydantic
│   │   ├── store.py           # Job store in-memory
│   │   ├── routers/jobs.py    # API endpoints
│   │   ├── services/          # Pipeline de processamento
│   │   │   ├── pipeline.py    # Orquestrador
│   │   │   ├── audio.py       # Extração de áudio
│   │   │   ├── silence.py     # Detecção de silêncio
│   │   │   ├── transcription.py # Whisper
│   │   │   ├── filler.py      # Filler words
│   │   │   ├── repetition.py  # Repetições
│   │   │   ├── merger.py      # Merge de segmentos
│   │   │   └── cutter.py      # Corte FFmpeg
│   │   └── utils/
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/jobs` | Upload vídeo + configurações |
| `GET` | `/api/jobs/{id}` | Status do job |
| `GET` | `/api/jobs/{id}/progress` | SSE stream de progresso |
| `GET` | `/api/jobs/{id}/download` | Download do vídeo processado |
| `GET` | `/api/health` | Health check |

---

## Configurações de corte

| Parâmetro | Default | Descrição |
|-----------|---------|-----------|
| `silence_threshold_db` | -35 dB | Limiar de detecção de silêncio |
| `min_silence_duration` | 0.5s | Duração mínima para considerar silêncio |
| `detect_fillers` | true | Detectar filler words |
| `detect_repetitions` | true | Detectar repetições |
| `padding_ms` | 100ms | Margem mantida ao redor dos cortes |

---

## Troubleshooting

### "Não foi possível conectar ao servidor"
O backend não está rodando. Verifique se o uvicorn está ativo na porta 8000.

### FFmpeg não encontrado
Defina o caminho completo no `backend/.env`:
```env
FFMPEG_PATH=C:\Users\SeuUsuario\bin\ffmpeg.exe
FFPROBE_PATH=C:\Users\SeuUsuario\bin\ffprobe.exe
```

### Whisper lento
O modelo `base` em CPU pode levar 1-3 minutos dependendo do tamanho do vídeo. Para mais velocidade, use GPU (CUDA) ou troque para o modelo `tiny` no `.env`:
```env
WHISPER_MODEL=tiny
```

### Erro de torch/whisper
Se houver incompatibilidade, instale torch CPU compatível:
```bash
pip install "torch==2.5.1" --index-url https://download.pytorch.org/whl/cpu
```
