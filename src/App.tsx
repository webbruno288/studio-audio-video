
import { useRef, useState } from 'react'
import {
  AudioLines, Video, Music2, Image as ImageIcon,
  FolderOpen, Upload, Plus, Scissors, Settings,
  Play, Pause, Trash2, Film, Volume2,
  ArrowLeft, Mic, Headphones, SlidersHorizontal
} from 'lucide-react'

type Media = {
  id: number
  name: string
  type: string
  url: string
}

type EditorMode = 'home' | 'video' | 'music'

export default function App() {
  const [media, setMedia] = useState<Media[]>([])
  const [selected, setSelected] = useState<Media | null>(null)
  const [mode, setMode] = useState<EditorMode>('video')
  const [playing, setPlaying] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const visibleMedia = media.filter(item =>
    mode === 'music'
      ? item.type.startsWith('audio/')
      : mode === 'video'
        ? true
        : false
  )

  function importFiles(files: FileList | null) {
    if (!files) return

    const added = Array.from(files)
      .filter(file => {
        if (mode === 'music') return file.type.startsWith('audio/')
        return file.type.startsWith('audio/') ||
          file.type.startsWith('video/') ||
          file.type.startsWith('image/')
      })
      .map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }))

    setMedia(old => [...old, ...added])

    if (added.length) {
      setSelected(added[0])
    }

    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  function removeMedia(id: number) {
    const item = media.find(file => file.id === id)

    if (item) {
      URL.revokeObjectURL(item.url)
    }

    const remaining = media.filter(file => file.id !== id)
    setMedia(remaining)

    if (selected?.id === id) {
      setSelected(remaining[0] || null)
      setPlaying(false)
    }
  }

  function togglePlayback() {
    const player = selected?.type.startsWith('video/')
      ? videoRef.current
      : selected?.type.startsWith('audio/')
        ? audioRef.current
        : null

    if (!player) return

    if (player.paused) {
      void player.play()
      setPlaying(true)
    } else {
      player.pause()
      setPlaying(false)
    }
  }

  function openEditor(editor: 'video' | 'music') {
  setMode(editor)
  setPlaying(false)

  setSelected(current => {
    if (editor === 'music') {
      return current?.type.startsWith('audio/')
        ? current
        : media.find(item => item.type.startsWith('audio/')) || null
    }

    return current || media[0] || null
  })
}

  function goHome() {
    setMode('home')
    setSelected(null)
    setPlaying(false)
  }

  if (mode === 'home') {
    return (
      <main className="app">
        <header className="topbar">
          <div className="brand">
            <AudioLines size={27} />
            <span>STUDIO</span>
          </div>
          <span className="status">● PROJECTO LOCAL</span>
        </header>

        <section className="welcome">
          <p className="eyebrow">A SUA CRIATIVIDADE, SEM LIMITES</p>
          <h1>O teu estúdio.<br />
            <span>A tua criação.</span>
          </h1>
          <p className="sub">
            Escolhe o teu ambiente de trabalho e começa a criar.
          </p>
        </section>

        <section className="editor-choice">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CENTRO DE CRIAÇÃO</p>
              <h2>Onde vamos trabalhar?</h2>
            </div>
          </div>

          <button
            className="editor-card video-card"
            onClick={() => openEditor('video')}
          >
            <div className="editor-card-icon">
              <Video size={32} />
            </div>
            <div className="editor-card-content">
              <span className="eyebrow">PRODUÇÃO VISUAL</span>
              <h2>Editor de Vídeo</h2>
              <p>
                Montagem, cortes, imagens, vídeos, efeitos e bandas sonoras.
              </p>
              <strong>ENTRAR NO EDITOR <span>→</span></strong>
            </div>
          </button>

          <button
            className="editor-card music-card"
            onClick={() => openEditor('music')}
          >
            <div className="editor-card-icon">
              <AudioLines size={32} />
            </div>
            <div className="editor-card-content">
              <span className="eyebrow">PRODUÇÃO SONORA</span>
              <h2>Editor de Música</h2>
              <p>
                Captação vocal, gravação, faixas, edição e mistura de áudio.
              </p>
              <strong>ENTRAR NO EDITOR <span>→</span></strong>
            </div>
          </button>
        </section>

        <footer className="studio-footer">
          <AudioLines size={17} />
          <span>STUDIO — AUDIO & VIDEO WORKSPACE</span>
        </footer>
      </main>
    )
  }

  const isMusic = mode === 'music'

  return (
    <main className="app">
      <header className="topbar">
        <button className="back-button" onClick={goHome}>
          <ArrowLeft size={19} />
          <span>STUDIO</span>
        </button>

        <div className="brand">
          {isMusic ? <AudioLines size={23} /> : <Video size={23} />}
          <span>{isMusic ? 'MUSIC' : 'VIDEO'}</span>
        </div>

        <span className="status">● LOCAL</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">
          {isMusic ? 'AUDIO WORKSPACE' : 'VIDEO WORKSPACE'}
        </p>
        <h1>
          {isMusic ? 'O teu espaço de som.' : 'O teu espaço visual.'}
        </h1>
        <p className="sub">
          {isMusic
            ? 'Prepara as tuas gravações e produções musicais.'
            : 'Organiza os teus vídeos, imagens e bandas sonoras.'}
        </p>

        <button
          className="primary"
          onClick={() => fileRef.current?.click()}
        >
          <Plus size={19} />
          Importar {isMusic ? 'áudio' : 'ficheiros'}
        </button>

        <input
          ref={fileRef}
          hidden
          type="file"
          multiple
          accept={isMusic ? 'audio/*' : 'audio/*,video/*,image/*'}
          onChange={e => importFiles(e.target.files)}
        />
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MONITOR</p>
            <h2>{isMusic ? 'Monitor de áudio' : 'Pré-visualização'}</h2>
          </div>
          <span className="count">
            {visibleMedia.length} ficheiros
          </span>
        </div>

        <div className="preview">
          {selected ? (
            selected.type.startsWith('video/') ? (
              <video
                ref={videoRef}
                src={selected.url}
                controls
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            ) : selected.type.startsWith('image/') ? (
              <img src={selected.url} alt={selected.name} />
            ) : (
              <div className="audio-preview">
                {isMusic
                  ? <Headphones size={54} />
                  : <Music2 size={54} />}
                <h3>{selected.name}</h3>
                <audio
                  ref={audioRef}
                  src={selected.url}
                  controls
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
              </div>
            )
          ) : (
            <div className="empty-preview">
              <div className="preview-icon">
                {isMusic
                  ? <AudioLines size={38} />
                  : <Film size={38} />}
              </div>
              <h3>{isMusic ? 'Monitor de som' : 'Monitor de vídeo'}</h3>
              <p>Selecciona um ficheiro na biblioteca para começar.</p>
            </div>
          )}
        </div>

        <div className="section-heading library-heading">
          <div>
            <p className="eyebrow">
              {isMusic ? 'AUDIO LIBRARY' : 'MEDIA LIBRARY'}
            </p>
            <h2>{isMusic ? 'Biblioteca de áudio' : 'Biblioteca de media'}</h2>
          </div>

          <button
            className="icon-button"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={19} />
          </button>
        </div>

        {visibleMedia.length === 0 ? (
          <div className="empty-library">
            <FolderOpen size={30} />
            <p>
              {isMusic
                ? 'Ainda não existem ficheiros de áudio.'
                : 'A tua biblioteca está vazia.'}
            </p>
            <button onClick={() => fileRef.current?.click()}>
              Adicionar ficheiros
            </button>
          </div>
        ) : (
          <div className="media-list">
            {visibleMedia.map(item => (
              <div
                className={`media-item ${
                  selected?.id === item.id ? 'active' : ''
                }`}
                key={item.id}
              >
                <button
                  className="media-select"
                  onClick={() => {
                    setSelected(item)
                    setPlaying(false)
                  }}
                >
                  {item.type.startsWith('video/') ? <Video /> :
                    item.type.startsWith('image/') ? <ImageIcon /> :
                      <Music2 />}

                  <span>{item.name}</span>
                  <small>{item.type.split('/')[0]}</small>
                </button>

                <button
                  className="delete-button"
                  onClick={() => removeMedia(item.id)}
                  aria-label="Eliminar ficheiro"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="timeline">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {isMusic ? 'AUDIO SEQUENCER' : 'VIDEO EDITOR'}
            </p>
            <h2>{isMusic ? 'Área de áudio' : 'Linha de edição'}</h2>
          </div>
          {isMusic
            ? <SlidersHorizontal size={20} />
            : <Scissors size={20} />}
        </div>

        <div className="timeline-toolbar">
          <button
            onClick={togglePlayback}
            disabled={!selected || selected.type.startsWith('image/')}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
            {playing ? 'Pausar' : 'Reproduzir'}
          </button>

          <span>{visibleMedia.length} ficheiros disponíveis</span>
        </div>

        <div className="timeline-ruler">
          <span>00:00</span>
          <span>00:10</span>
          <span>00:20</span>
          <span>00:30</span>
        </div>

        {isMusic ? (
          <div className="track">
            <div className="track-label">
              <Volume2 size={17} /> FAIXAS DE ÁUDIO
            </div>
            <div className="track-content">
              {visibleMedia.map(item => (
                <button
                  key={item.id}
                  className={`clip audio-clip ${
                    selected?.id === item.id ? 'clip-active' : ''
                  }`}
                  onClick={() => {
                    setSelected(item)
                    setPlaying(false)
                  }}
                >
                  <Music2 size={15} />
                  <span>{item.name}</span>
                </button>
              ))}

              {visibleMedia.length === 0 && (
                <span className="track-empty">
                  Importa áudio para começar
                </span>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="track">
              <div className="track-label">
                <Film size={17} /> VÍDEO E IMAGEM
              </div>
              <div className="track-content">
                {visibleMedia
                  .filter(item =>
                    item.type.startsWith('video/') ||
                    item.type.startsWith('image/')
                  )
                  .map(item => (
                    <button
                      key={item.id}
                      className={`clip video-clip ${
                        selected?.id === item.id ? 'clip-active' : ''
                      }`}
                      onClick={() => {
                        setSelected(item)
                        setPlaying(false)
                      }}
                    >
                      <Video size={15} />
                      <span>{item.name}</span>
                    </button>
                  ))}
                {!visibleMedia.some(item =>
                  item.type.startsWith('video/') ||
                  item.type.startsWith('image/')
                ) && (
                  <span className="track-empty">
                    Adiciona um vídeo ou imagem
                  </span>
                )}
              </div>
            </div>

            <div className="track">
              <div className="track-label">
                <Volume2 size={17} /> BANDA SONORA
              </div>
              <div className="track-content">
                {visibleMedia
                  .filter(item => item.type.startsWith('audio/'))
                  .map(item => (
                    <button
                      key={item.id}
                      className={`clip audio-clip ${
                        selected?.id === item.id ? 'clip-active' : ''
                      }`}
                      onClick={() => {
                        setSelected(item)
                        setPlaying(false)
                      }}
                    >
                      <Music2 size={15} />
                      <span>{item.name}</span>
                    </button>
                  ))}
                {!visibleMedia.some(item =>
                  item.type.startsWith('audio/')
                ) && (
                  <span className="track-empty">
                    Adiciona uma banda sonora
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        <p className="timeline-note">
          {isMusic
            ? 'Ambiente de produção musical. A gravação vocal e a mistura serão implementadas nas próximas etapas.'
            : 'Ambiente de montagem audiovisual. A edição sincronizada, os cortes e os efeitos serão implementados nas próximas etapas.'}
        </p>
      </section>

      {isMusic && (
        <section className="timeline">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RECORDING STUDIO</p>
              <h2>Captação vocal</h2>
            </div>
            <Mic size={22} />
          </div>
          <p className="timeline-note">
            O módulo de gravação com microfone será activado numa próxima etapa.
          </p>
        </section>
      )}

      <nav className="bottom-nav">
        <button className="nav-active" onClick={goHome}>
          <AudioLines />
          <span>Início</span>
        </button>
        <button onClick={() => fileRef.current?.click()}>
          <FolderOpen />
          <span>Biblioteca</span>
        </button>
        <button onClick={goHome}>
          <Settings />
          <span>Ambientes</span>
        </button>
      </nav>
    </main>
  )
}
