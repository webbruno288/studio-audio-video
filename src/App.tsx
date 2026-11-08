
import { useRef, useState } from 'react'
import {
  AudioLines, Video, Music2, Image as ImageIcon,
  Plus, Bell, FolderOpen, Sparkles, Layers, Type,
  Play, Pause, Trash2, Volume2, Mic, Headphones,
  SlidersHorizontal, Film, X
} from 'lucide-react'
import VideoTimeline from './VideoTimeline'

type Media = {
  id: number
  name: string
  type: string
  url: string
  duration: number
}

type EditorMode = 'video' | 'music'
type VideoPanel = 'media' | 'effects' | 'transitions' | 'text'
type MusicPanel = 'tracks' | 'effects' | 'mixer'

export default function App() {
  const [media, setMedia] = useState<Media[]>([])
  const [selected, setSelected] = useState<Media | null>(null)
  const [mode, setMode] = useState<EditorMode>('video')
  const [videoPanel, setVideoPanel] = useState<VideoPanel>('media')
  const [musicPanel, setMusicPanel] = useState<MusicPanel>('tracks')
  const [playing, setPlaying] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const videoFileRef = useRef<HTMLInputElement>(null)
  const audioFileRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const videoMedia = media.filter(item =>
    item.type.startsWith('video/') ||
    item.type.startsWith('image/')
  )

  const audioMedia = media.filter(item =>
    item.type.startsWith('audio/')
  )

  function importFiles(files: FileList | null, kind: 'video' | 'audio') {
    if (!files) return

    const added = Array.from(files)
      .filter(file => kind === 'audio'
        ? file.type.startsWith('audio/')
        : file.type.startsWith('video/') || file.type.startsWith('image/')
      )
      .map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        duration: file.type.startsWith('image/') ? 5 : 0
      }))

    if (added.length) {
      setMedia(old => [...old, ...added])
      setSelected(added[0])
      setPlaying(false)

      added.forEach(item => {
        if (item.type.startsWith('image/')) return

        const probe = document.createElement(
          item.type.startsWith('audio/') ? 'audio' : 'video'
        )

        probe.preload = 'metadata'
        probe.onloadedmetadata = () => {
          const duration = Number.isFinite(probe.duration) ? probe.duration : 0
          setMedia(old => old.map(file =>
            file.id === item.id ? { ...file, duration } : file
          ))
          probe.removeAttribute('src')
          probe.load()
        }

        probe.onerror = () => {
          probe.removeAttribute('src')
          probe.load()
        }

        probe.src = item.url
      })
    }

    if (kind === 'audio' && audioFileRef.current) {
      audioFileRef.current.value = ''
    }

    if (kind === 'video' && videoFileRef.current) {
      videoFileRef.current.value = ''
    }
  }

  function openEditor(editor: EditorMode) {
    audioRef.current?.pause()
    videoRef.current?.pause()
    setPlaying(false)
    setMode(editor)
    setNotificationsOpen(false)

    setSelected(current => {
      if (editor === 'music') {
        return current?.type.startsWith('audio/')
          ? current
          : audioMedia[0] || null
      }

      return current || videoMedia[0] || audioMedia[0] || null
    })
  }

  function selectMedia(item: Media) {
    setSelected(item)
    setPlaying(false)
    audioRef.current?.pause()
    videoRef.current?.pause()
  }

  function removeMedia(id: number) {
    const item = media.find(file => file.id === id)
    if (item) URL.revokeObjectURL(item.url)

    const remaining = media.filter(file => file.id !== id)
    setMedia(remaining)

    if (selected?.id === id) {
      setSelected(
        mode === 'music'
          ? remaining.find(file => file.type.startsWith('audio/')) || null
          : remaining[0] || null
      )
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
      void player.play().catch(() => setPlaying(false))
    } else {
      player.pause()
    }
  }

  function importButton(kind: 'video' | 'audio') {
    if (kind === 'audio') audioFileRef.current?.click()
    else videoFileRef.current?.click()
  }

  const isMusic = mode === 'music'

  return (
    <main className={`app ${isMusic ? 'music-mode' : 'video-mode'}`}>

      <input
        ref={videoFileRef}
        hidden
        type="file"
        multiple
        accept="video/*,image/*"
        onChange={e => importFiles(e.target.files, 'video')}
      />

      <input
        ref={audioFileRef}
        hidden
        type="file"
        multiple
        accept="audio/*"
        onChange={e => importFiles(e.target.files, 'audio')}
      />

      <header className="topbar">
        <div className="brand">
          <AudioLines size={24} />
          <span>KAPIA ONE PRO</span>
        </div>

        <div className="topbar-actions">
          <button
            className="workspace-switch"
            onClick={() => openEditor(isMusic ? 'video' : 'music')}
            title={isMusic ? 'Mudar para editor de vídeo' : 'Mudar para estúdio musical'}
            aria-label={isMusic ? 'Mudar para editor de vídeo' : 'Mudar para estúdio musical'}
          >
            {isMusic ? <Video size={14} /> : <AudioLines size={14} />}
            <span>{isMusic ? 'VÍDEO' : 'MÚSICA'}</span>
            <span className="workspace-switch-arrow">⌄</span>
          </button>

          <div className="notification-area">
            <button
              className={`mode-button notification-button ${notificationsOpen ? 'mode-active' : ''}`}
              onClick={() => setNotificationsOpen(value => !value)}
              title="Notificações"
              aria-label="Notificações"
            >
              <Bell size={18} />
            </button>

            {notificationsOpen && (
              <div className="notification-panel">
                <div className="notification-title">
                  <strong>Notificações</strong>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Fechar"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p>Ainda não tens notificações.</p>
                <small>Os avisos do KAPIA ONE PRO aparecerão aqui.</small>
              </div>
            )}
          </div>
        </div>
      </header>

      {isMusic ? (
        <div className="music-layout">

          <aside className="tool-sidebar">
            <button
              className={musicPanel === 'tracks' ? 'tool-active' : ''}
              onClick={() => setMusicPanel('tracks')}
              title="Faixas"
            >
              <AudioLines />
              <span>Faixas</span>
            </button>

            <button
              className={musicPanel === 'effects' ? 'tool-active' : ''}
              onClick={() => setMusicPanel('effects')}
              title="Efeitos"
            >
              <Sparkles />
              <span>Efeitos</span>
            </button>

            <button
              className={musicPanel === 'mixer' ? 'tool-active' : ''}
              onClick={() => setMusicPanel('mixer')}
              title="Misturador"
            >
              <SlidersHorizontal />
              <span>Mistura</span>
            </button>
          </aside>

          <aside className="asset-panel">
            {musicPanel === 'tracks' && (
              <>
                <div className="panel-heading">
                  <span>BIBLIOTECA DE ÁUDIO</span>
                  <button
                    className="small-plus"
                    onClick={() => importButton('audio')}
                  >
                    <Plus size={17} />
                  </button>
                </div>

                {audioMedia.map(item => (
                  <button
                    key={item.id}
                    className={`asset-item ${selected?.id === item.id ? 'asset-selected' : ''}`}
                    onClick={() => selectMedia(item)}
                  >
                    <Music2 size={17} />
                    <span>{item.name}</span>
                    <span
                      className="asset-delete"
                      onClick={e => {
                        e.stopPropagation()
                        removeMedia(item.id)
                      }}
                      role="button"
                      aria-label="Eliminar áudio"
                    >
                      <Trash2 size={15} />
                    </span>
                  </button>
                ))}

                {audioMedia.length === 0 && (
                  <p className="panel-empty">Toca no + para adicionar áudio.</p>
                )}
              </>
            )}

            {musicPanel === 'effects' && (
              <>
                <div className="panel-heading">EFEITOS DE ÁUDIO</div>
                <div className="tool-placeholder">
                  <Sparkles size={25} />
                  <strong>Efeitos sonoros</strong>
                  <p>Equalização, reverberação e outros efeitos serão implementados nesta área.</p>
                </div>
              </>
            )}

            {musicPanel === 'mixer' && (
              <>
                <div className="panel-heading">MISTURADOR</div>
                <div className="tool-placeholder">
                  <SlidersHorizontal size={25} />
                  <strong>Mistura de áudio</strong>
                  <p>Os controlos de volume e mistura avançada serão adicionados nesta área.</p>
                </div>
              </>
            )}
          </aside>

          <section className="music-main">
            <div className="editor-heading">
              <div>
                <span className="eyebrow">AUDIO WORKSPACE</span>
                <h1>Estúdio de música</h1>
              </div>
              <span className="local-status">● LOCAL</span>
            </div>

            <div className="music-monitor">
              <div className="audio-artwork">
                <Headphones size={48} />
                <span>KAPIA ONE PRO AUDIO</span>
              </div>

              <div className="music-now-playing">
                <span>FAIXA SELECCIONADA</span>
                <strong>
                  {selected?.type.startsWith('audio/')
                    ? selected.name
                    : 'Nenhum áudio seleccionado'}
                </strong>

                {selected?.type.startsWith('audio/') && (
                  <audio
                    ref={audioRef}
                    src={selected.url}
                    controls
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                  />
                )}
              </div>
            </div>

            <section className="timeline music-timeline">
              <div className="timeline-heading">
                <div>
                  <span className="eyebrow">AUDIO SEQUENCER</span>
                  <h2>Linha de áudio</h2>
                </div>

                <button
                  className="small-plus"
                  onClick={() => importButton('audio')}
                >
                  <Plus size={17} />
                </button>
              </div>

              <div className="timeline-toolbar">
                <button
                  onClick={togglePlayback}
                  disabled={!selected?.type.startsWith('audio/')}
                >
                  {playing ? <Pause size={17} /> : <Play size={17} />}
                  {playing ? 'Pausar' : 'Reproduzir'}
                </button>
                <span>{audioMedia.length} faixas</span>
              </div>

              <div className="timeline-ruler">
                <span>00:00</span>
                <span>00:10</span>
                <span>00:20</span>
                <span>00:30</span>
              </div>

              <div className="track">
                <button
                  className="track-plus"
                  onClick={() => importButton('audio')}
                  title="Adicionar faixa de áudio"
                >
                  <Plus size={17} />
                </button>

                <div className="track-label">
                  <Volume2 size={16} />
                  <span>ÁUDIO 01</span>
                </div>

                <div className="track-content">
                  {audioMedia.map(item => (
                    <button
                      key={item.id}
                      className={`clip audio-clip ${selected?.id === item.id ? 'clip-active' : ''}`}
                      onClick={() => selectMedia(item)}
                    >
                      <AudioLines size={15} />
                      <span>{item.name}</span>
                    </button>
                  ))}

                  {audioMedia.length === 0 && (
                    <span className="track-empty">Adiciona áudio no +</span>
                  )}
                </div>
              </div>

              <p className="timeline-note">
                A gravação vocal, edição de ondas e mistura avançada serão desenvolvidas nas próximas etapas.
              </p>
            </section>

            <section className="recording-panel">
              <Mic size={22} />
              <div>
                <strong>Captação vocal</strong>
                <p>Área preparada para futuras gravações com microfone.</p>
              </div>
            </section>
          </section>
        </div>
      ) : (
        <div className="video-layout">

          <aside className="tool-sidebar">
            <button
              className={videoPanel === 'media' ? 'tool-active' : ''}
              onClick={() => setVideoPanel('media')}
              title="Media"
            >
              <FolderOpen />
              <span>Media</span>
            </button>

            <button
              className={videoPanel === 'effects' ? 'tool-active' : ''}
              onClick={() => setVideoPanel('effects')}
              title="Efeitos"
            >
              <Sparkles />
              <span>Efeitos</span>
            </button>

            <button
              className={videoPanel === 'transitions' ? 'tool-active' : ''}
              onClick={() => setVideoPanel('transitions')}
              title="Transições"
            >
              <Layers />
              <span>Transições</span>
            </button>

            <button
              className={videoPanel === 'text' ? 'tool-active' : ''}
              onClick={() => setVideoPanel('text')}
              title="Texto"
            >
              <Type />
              <span>Texto</span>
            </button>
          </aside>

          <aside className="asset-panel">
            {videoPanel === 'media' && (
              <>
                <div className="panel-heading">
                  <span>PROJECT MEDIA</span>
                  <button
                    className="small-plus"
                    onClick={() => importButton('video')}
                  >
                    <Plus size={17} />
                  </button>
                </div>

                {videoMedia.map(item => (
                  <button
                    key={item.id}
                    className={`asset-item ${selected?.id === item.id ? 'asset-selected' : ''}`}
                    onClick={() => selectMedia(item)}
                  >
                    {item.type.startsWith('video/')
                      ? <Video size={17} />
                      : <ImageIcon size={17} />}
                    <span>{item.name}</span>

                    <span
                      className="asset-delete"
                      onClick={e => {
                        e.stopPropagation()
                        removeMedia(item.id)
                      }}
                      role="button"
                      aria-label="Eliminar ficheiro"
                    >
                      <Trash2 size={15} />
                    </span>
                  </button>
                ))}

                {videoMedia.length === 0 && (
                  <p className="panel-empty">Toca no + para adicionar vídeos ou imagens.</p>
                )}
              </>
            )}

            {videoPanel === 'effects' && (
              <>
                <div className="panel-heading">EFEITOS VISUAIS</div>
                <div className="tool-placeholder">
                  <Sparkles size={25} />
                  <strong>Efeitos</strong>
                  <p>Filtros, correcção de cor e efeitos visuais serão adicionados aqui.</p>
                </div>
              </>
            )}

            {videoPanel === 'transitions' && (
              <>
                <div className="panel-heading">TRANSIÇÕES</div>
                <div className="tool-placeholder">
                  <Layers size={25} />
                  <strong>Transições</strong>
                  <p>Passagens entre cenas e animações serão adicionadas aqui.</p>
                </div>
              </>
            )}

            {videoPanel === 'text' && (
              <>
                <div className="panel-heading">TEXTO E TÍTULOS</div>
                <div className="tool-placeholder">
                  <Type size={25} />
                  <strong>Títulos</strong>
                  <p>Ferramentas para inserir textos e legendas serão adicionadas aqui.</p>
                </div>
              </>
            )}
          </aside>

          <section className="video-main">
            <div className="editor-heading">
              <div>
                <span className="eyebrow">VIDEO WORKSPACE</span>
                <h1>Editor de vídeo</h1>
              </div>
              <span className="local-status">● LOCAL</span>
            </div>

            <div className="video-monitor">
              {selected?.type.startsWith('video/') ? (
                <video
                  ref={videoRef}
                  src={selected.url}
                  controls
                  playsInline
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
              ) : selected?.type.startsWith('image/') ? (
                <img src={selected.url} alt={selected.name} />
              ) : (
                <div className="empty-monitor">
                  <Film size={48} />
                  <strong>Monitor de vídeo</strong>
                  <p>Adiciona um vídeo ou imagem usando o botão + na faixa.</p>
                </div>
              )}
            </div>

            <VideoTimeline
              media={media}
              selectedId={selected?.id ?? null}
              playing={playing}
              onSelect={selectMedia}
              onImport={() => importButton('video')}
              onPlayback={togglePlayback}
            />
          </section>
        </div>
      )}
    </main>
  )
}
