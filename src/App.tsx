
import { useRef, useState } from 'react'
import { Upload, Play, Pause, Music2, Video, Image, FolderOpen, Scissors, Settings, Plus, X, AudioLines } from 'lucide-react'

type Media = {
  id: number
  name: string
  type: string
  url: string
}

export default function App() {
  const [media, setMedia] = useState<Media[]>([])
  const [selected, setSelected] = useState<Media | null>(null)
  const [playing, setPlaying] = useState(false)
  const [tab, setTab] = useState('Estúdio')
  const fileRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  function importFiles(files: FileList | null) {
    if (!files) return
    const added = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    }))
    setMedia(old => [...old, ...added])
    if (added.length) setSelected(added[0])
  }

  function togglePlay() {
    const player = selected?.type.startsWith('video/') ? videoRef.current : audioRef.current
    if (!player) return
    if (player.paused) {
      void player.play()
      setPlaying(true)
    } else {
      player.pause()
      setPlaying(false)
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand"><AudioLines size={25} /><span>STUDIO</span></div>
        <span className="status">● PROJECTO LOCAL</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">A SUA CRIATIVIDADE, SEM LIMITES</p>
        <h1>O teu estúdio.<br /><span>A tua criação.</span></h1>
        <p className="sub">Um espaço para criar, organizar e explorar áudio e vídeo.</p>
        <button className="primary" onClick={() => fileRef.current?.click()}>
          <Plus size={19} /> Importar ficheiros
        </button>
        <input ref={fileRef} hidden type="file" multiple accept="audio/*,video/*,image/*" onChange={e => importFiles(e.target.files)} />
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div><p className="eyebrow">WORKSPACE</p><h2>Área de trabalho</h2></div>
          <span className="count">{media.length} ficheiros</span>
        </div>

        <div className="preview">
          {selected ? (
            selected.type.startsWith('video/') ? (
              <video ref={videoRef} src={selected.url} controls playsInline onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
            ) : selected.type.startsWith('image/') ? (
              <img src={selected.url} alt={selected.name} />
            ) : (
              <div className="audio-preview">
                <Music2 size={54} />
                <h3>{selected.name}</h3>
                <audio ref={audioRef} src={selected.url} controls onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
              </div>
            )
          ) : (
            <div className="empty-preview">
              <div className="preview-icon"><Video size={35} /></div>
              <h3>Pré-visualização</h3>
              <p>Importa um ficheiro para começar a trabalhar.</p>
            </div>
          )}
        </div>

        <div className="section-heading library-heading">
          <div><p className="eyebrow">MEDIA MANAGER</p><h2>Biblioteca</h2></div>
          <button className="icon-button" onClick={() => fileRef.current?.click()}><Upload size={19} /></button>
        </div>

        {media.length === 0 ? (
          <div className="empty-library"><FolderOpen size={30} /><p>A tua biblioteca está vazia.</p><button onClick={() => fileRef.current?.click()}>Adicionar primeiro ficheiro</button></div>
        ) : (
          <div className="media-list">
            {media.map(item => (
              <button className={`media-item ${selected?.id === item.id ? 'active' : ''}`} key={item.id} onClick={() => { setSelected(item); setPlaying(false) }}>
                {item.type.startsWith('video/') ? <Video /> : item.type.startsWith('image/') ? <Image /> : <Music2 />}
                <span>{item.name}</span>
                <small>{item.type.split('/')[0]}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="timeline">
        <div className="section-heading"><div><p className="eyebrow">EDITOR</p><h2>Linha de edição</h2></div><Scissors size={20} /></div>
        <div className="timeline-track">
          <span>00:00</span>
          <div className="track-line"><div /></div>
          <span>00:30</span>
        </div>
        <p className="timeline-note">A edição por faixas será desenvolvida na próxima fase.</p>
      </section>

      <nav className="bottom-nav">
        {['Estúdio', 'Biblioteca', 'Projectos', 'Definições'].map((item, i) => (
          <button key={item} className={tab === item ? 'nav-active' : ''} onClick={() => { setTab(item); if(item === 'Biblioteca') document.querySelector('.library-heading')?.scrollIntoView({ behavior: 'smooth' }) }}>
            {i === 0 ? <AudioLines /> : i === 1 ? <FolderOpen /> : i === 2 ? <Video /> : <Settings />}
            <span>{item}</span>
          </button>
        ))}
      </nav>
    </main>
  )
}
