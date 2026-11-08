import { useEffect, useMemo, useState } from 'react'
import {
  Film, Music2, Plus, Play, Pause, Scissors, Trash2,
  Clock, RotateCcw, Lock, Unlock, Eye, EyeOff,
  Volume2, VolumeX, Layers, ChevronDown
} from 'lucide-react'

type TimelineMedia = {
  id: number
  name: string
  type: string
  url: string
  duration: number
}

type Clip = {
  id: string
  mediaId: number
  start: number
  sourceStart: number
  sourceEnd: number
}

type Track = {
  id: string
  kind: 'video' | 'audio'
  name: string
  clips: Clip[]
  muted: boolean
  hidden: boolean
  locked: boolean
}

type Props = {
  media: TimelineMedia[]
  selectedId: number | null
  playing: boolean
  onSelect: (item: TimelineMedia) => void
  onImport: () => void
  onPlayback: () => void
}

const SCALE = 42
const MIN_DURATION = 0.1

const makeTrack = (kind: 'video' | 'audio', number: number): Track => ({
  id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  kind,
  name: `${kind === 'video' ? 'Vídeo' : 'Áudio'} ${number}`,
  clips: [],
  muted: false,
  hidden: false,
  locked: false
})

export default function VideoTimeline({
  media,
  selectedId,
  playing,
  onSelect,
  onImport,
  onPlayback
}: Props) {
  void selectedId
  const [tracks, setTracks] = useState<Track[]>([
    makeTrack('video', 1),
    makeTrack('audio', 1)
  ])
  const [playhead, setPlayhead] = useState(0)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null)
  const [showTrim, setShowTrim] = useState(true)

  const getMedia = (id: number) => media.find(item => item.id === id)

  const clipDuration = (clip: Clip) =>
    Math.max(MIN_DURATION, clip.sourceEnd - clip.sourceStart)

  const clipEnd = (clip: Clip) => clip.start + clipDuration(clip)

  // Adiciona automaticamente os ficheiros importados à primeira pista compatível.
  // Quando a duração real chega, actualiza também a duração do clip.
  useEffect(() => {
    setTracks(previous => {
      let next = [...previous]

      for (const item of media) {
        const kind: 'video' | 'audio' =
          item.type.startsWith('audio/') ? 'audio' : 'video'

        const existingTrackIndex = next.findIndex(track =>
          track.kind === kind && track.clips.some(clip => clip.mediaId === item.id)
        )

        if (existingTrackIndex >= 0) {
          next = next.map((track, index) => {
            if (index !== existingTrackIndex) return track

            return {
              ...track,
              clips: track.clips.map(clip => {
                if (clip.mediaId !== item.id) return clip
                if (item.duration <= 0) return clip

                const oldDuration = clip.sourceEnd - clip.sourceStart
                if (oldDuration <= MIN_DURATION + 0.01) {
                  return { ...clip, sourceEnd: item.duration }
                }
                return clip
              })
            }
          })
          continue
        }

        let targetIndex = next.findIndex(track =>
          track.kind === kind && !track.locked
        )

        if (targetIndex < 0) {
          const sameKindCount = next.filter(track => track.kind === kind).length
          next.push(makeTrack(kind, sameKindCount + 1))
          targetIndex = next.length - 1
        }

        const target = next[targetIndex]
        const position = target.clips.reduce(
          (end, clip) => Math.max(end, clipEnd(clip)), 0
        )

        const duration = item.duration > 0 ? item.duration : MIN_DURATION

        const newClip: Clip = {
          id: `clip-${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          mediaId: item.id,
          start: position,
          sourceStart: 0,
          sourceEnd: duration
        }

        next[targetIndex] = {
          ...target,
          clips: [...target.clips, newClip]
        }
      }

      // Remove clips cujo ficheiro já não existe na biblioteca.
      next = next.map(track => ({
        ...track,
        clips: track.clips.filter(clip =>
          media.some(item => item.id === clip.mediaId)
        )
      }))

      return next
    })
  }, [media])

  const selected = useMemo(() => {
    for (const track of tracks) {
      const clip = track.clips.find(item => item.id === selectedClipId)
      if (clip) return { clip, track }
    }
    return null
  }, [tracks, selectedClipId])

  const totalDuration = useMemo(() => {
    let end = 30
    for (const track of tracks) {
      for (const clip of track.clips) {
        end = Math.max(end, clipEnd(clip))
      }
    }
    return Math.max(30, end)
  }, [tracks])

  const selectedMedia = selected
    ? getMedia(selected.clip.mediaId)
    : null

  const addTrack = (kind: 'video' | 'audio') => {
    setTracks(previous => {
      const count = previous.filter(track => track.kind === kind).length
      return [...previous, makeTrack(kind, count + 1)]
    })
  }

  const updateTrack = (trackId: string, changes: Partial<Track>) => {
    setTracks(previous => previous.map(track =>
      track.id === trackId ? { ...track, ...changes } : track
    ))
  }

  const removeTrack = (trackId: string) => {
    setTracks(previous => {
      const target = previous.find(track => track.id === trackId)
      if (!target) return previous

      const count = previous.filter(track => track.kind === target.kind).length
      if (count <= 1) return previous

      setSelectedClipId(current =>
        target.clips.some(clip => clip.id === current) ? null : current
      )

      return previous.filter(track => track.id !== trackId)
    })
  }

  const selectClip = (clip: Clip) => {
    setSelectedClipId(clip.id)
    const item = getMedia(clip.mediaId)
    if (item) onSelect(item)
  }

  const splitSelected = () => {
    if (!selected) return

    const { clip, track } = selected
    const duration = clipDuration(clip)
    const localPosition = playhead - clip.start

    if (localPosition <= 0.05 || localPosition >= duration - 0.05) return
    if (track.locked) return

    const splitSource = clip.sourceStart + localPosition

    const left: Clip = {
      ...clip,
      sourceEnd: splitSource
    }

    const right: Clip = {
      ...clip,
      id: `clip-split-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      start: playhead,
      sourceStart: splitSource
    }

    setTracks(previous => previous.map(item =>
      item.id !== track.id
        ? item
        : {
            ...item,
            clips: item.clips.flatMap(current =>
              current.id === clip.id ? [left, right] : [current]
            )
          }
    ))

    setSelectedClipId(right.id)
  }

  const removeSelected = () => {
    if (!selected || selected.track.locked) return

    setTracks(previous => previous.map(track => ({
      ...track,
      clips: track.clips.filter(clip => clip.id !== selected.clip.id)
    })))

    setSelectedClipId(null)
  }

  const updateTrim = (field: 'sourceStart' | 'sourceEnd', value: number) => {
    if (!selected || selected.track.locked) return

    setTracks(previous => previous.map(track => {
      if (track.id !== selected.track.id) return track

      return {
        ...track,
        clips: track.clips.map(clip => {
          if (clip.id !== selected.clip.id) return clip

          const duration = selectedMedia?.duration || clip.sourceEnd
          const nextValue = Math.max(0, Math.min(value, duration))

          if (field === 'sourceStart') {
            const safeValue = Math.min(nextValue, clip.sourceEnd - MIN_DURATION)
            return {
              ...clip,
              sourceStart: safeValue,
              start: clip.start + safeValue - clip.sourceStart
            }
          }

          return {
            ...clip,
            sourceEnd: Math.max(clip.sourceStart + MIN_DURATION, nextValue)
          }
        })
      }
    }))
  }

  const resetTrim = () => {
    if (!selected || selected.track.locked) return

    const duration = selectedMedia?.duration
    if (!duration || duration <= 0) return

    setTracks(previous => previous.map(track =>
      track.id !== selected.track.id
        ? track
        : {
            ...track,
            clips: track.clips.map(clip =>
              clip.id === selected.clip.id
                ? { ...clip, sourceStart: 0, sourceEnd: duration }
                : clip
            )
          }
    ))
  }

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    targetTrack: Track
  ) => {
    event.preventDefault()
    if (targetTrack.locked) return

    const clipId = event.dataTransfer.getData('text/plain') || draggedClipId
    if (!clipId) return

    let sourceTrack: Track | undefined
    let movingClip: Clip | undefined

    for (const track of tracks) {
      const found = track.clips.find(clip => clip.id === clipId)
      if (found) {
        sourceTrack = track
        movingClip = found
        break
      }
    }

    if (!sourceTrack || !movingClip) return
    if (sourceTrack.id === targetTrack.id) return
    if (sourceTrack.kind !== targetTrack.kind) return

    const rect = event.currentTarget.getBoundingClientRect()
    const newPosition = Math.max(0, (event.clientX - rect.left) / SCALE)

    setTracks(previous => previous.map(track => {
      if (track.id === sourceTrack!.id) {
        return {
          ...track,
          clips: track.clips.filter(clip => clip.id !== clipId)
        }
      }

      if (track.id === targetTrack.id) {
        return {
          ...track,
          clips: [...track.clips, { ...movingClip!, start: newPosition }]
        }
      }

      return track
    }))

    setDraggedClipId(null)
  }

  const formatTime = (seconds: number) => {
    const safe = Math.max(0, seconds)
    const minutes = Math.floor(safe / 60)
    const secs = Math.floor(safe % 60)
    const frames = Math.floor((safe % 1) * 30)
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`
  }

  const rulerCount = Math.ceil(totalDuration / 5)

  return (
    <section className="mtl-root">
      <div className="mtl-header">
        <div className="mtl-heading">
          <Layers size={17} />
          <strong>Timeline de edição</strong>
          <span className="mtl-live">MULTIPISTA</span>
        </div>

        <div className="mtl-header-actions">
          <button type="button" onClick={() => addTrack('video')}>
            <Plus size={14} /> Vídeo
          </button>
          <button type="button" onClick={() => addTrack('audio')}>
            <Plus size={14} /> Áudio
          </button>
          <button type="button" onClick={onImport}>
            <Plus size={14} /> Importar
          </button>
        </div>
      </div>

      <div className="mtl-toolbar">
        <button type="button" className="mtl-play" onClick={onPlayback}>
          {playing ? <Pause size={15} /> : <Play size={15} />}
          {playing ? 'Pausar' : 'Reproduzir'}
        </button>

        <button type="button" onClick={splitSelected} disabled={!selected}>
          <Scissors size={15} /> Dividir no cursor
        </button>

        <button type="button" onClick={removeSelected} disabled={!selected}>
          <Trash2 size={15} /> Remover clip
        </button>

        <div className="mtl-time">
          <Clock size={14} />
          <strong>{formatTime(playhead)}</strong>
          <span>/ {formatTime(totalDuration)}</span>
        </div>
      </div>

      <div className="mtl-ruler">
        <div className="mtl-track-label mtl-ruler-label">PISTAS</div>
        <div className="mtl-ruler-scroll">
          <div className="mtl-ruler-inner" style={{ width: totalDuration * SCALE }}>
            {Array.from({ length: rulerCount + 1 }, (_, index) => (
              <div
                className="mtl-ruler-mark"
                key={index}
                style={{ left: index * 5 * SCALE }}
              >
                <span>{formatTime(index * 5).slice(0, 5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mtl-track-list">
        {tracks.map((track) => (
          <div className="mtl-track-row" key={track.id}>
            <div className="mtl-track-label">
              <div className={`mtl-track-icon ${track.kind}`}>
                {track.kind === 'video' ? <Film size={16} /> : <Music2 size={16} />}
              </div>

              <div className="mtl-track-name">
                <strong>{track.name}</strong>
                <small>{track.clips.length} clips</small>
              </div>

              <div className="mtl-track-controls">
                <button
                  type="button"
                  title={track.locked ? 'Desbloquear pista' : 'Bloquear pista'}
                  onClick={() => updateTrack(track.id, { locked: !track.locked })}
                >
                  {track.locked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>

                {track.kind === 'video' ? (
                  <button
                    type="button"
                    title={track.hidden ? 'Mostrar pista' : 'Ocultar pista'}
                    onClick={() => updateTrack(track.id, { hidden: !track.hidden })}
                  >
                    {track.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                ) : (
                  <button
                    type="button"
                    title={track.muted ? 'Activar áudio' : 'Silenciar pista'}
                    onClick={() => updateTrack(track.id, { muted: !track.muted })}
                  >
                    {track.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                )}

                <button
                  type="button"
                  title="Remover pista"
                  onClick={() => removeTrack(track.id)}
                  disabled={tracks.filter(item => item.kind === track.kind).length <= 1}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div
              className={`mtl-track-lane ${track.kind} ${track.locked ? 'locked' : ''}`}
              onDragOver={event => event.preventDefault()}
              onDrop={event => handleDrop(event, track)}
            >
              <div
                className="mtl-track-content"
                style={{ width: totalDuration * SCALE }}
              >
                {track.clips.map(clip => {
                  const item = getMedia(clip.mediaId)
                  if (!item) return null

                  const isSelected = selectedClipId === clip.id
                  const width = Math.max(35, clipDuration(clip) * SCALE)

                  return (
                    <button
                      type="button"
                      key={clip.id}
                      draggable={!track.locked}
                      onDragStart={event => {
                        event.dataTransfer.setData('text/plain', clip.id)
                        setDraggedClipId(clip.id)
                      }}
                      onDragEnd={() => setDraggedClipId(null)}
                      onClick={() => selectClip(clip)}
                      className={[
                        'mtl-clip',
                        track.kind,
                        isSelected ? 'selected' : '',
                        track.hidden || track.muted ? 'inactive' : ''
                      ].join(' ')}
                      style={{
                        left: clip.start * SCALE,
                        width
                      }}
                      title={`${item.name} | ${formatTime(clipDuration(clip))}`}
                    >
                      <span className="mtl-clip-icon">
                        {track.kind === 'video' ? <Film size={13} /> : <Music2 size={13} />}
                      </span>
                      <span className="mtl-clip-info">
                        <strong>{item.name}</strong>
                        <small>{formatTime(clipDuration(clip))}</small>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mtl-add-track">
        <button type="button" onClick={() => addTrack('video')}>
          <Plus size={15} /> Adicionar pista de vídeo
        </button>
        <button type="button" onClick={() => addTrack('audio')}>
          <Plus size={15} /> Adicionar pista de áudio
        </button>
      </div>

      <div className="mtl-playhead-control">
        <label htmlFor="mtl-playhead">Posição do cursor</label>
        <input
          id="mtl-playhead"
          type="range"
          min="0"
          max={totalDuration}
          step="0.01"
          value={Math.min(playhead, totalDuration)}
          onChange={event => setPlayhead(Number(event.target.value))}
        />
        <strong>{formatTime(playhead)}</strong>
      </div>

      <div className="mtl-inspector">
        <button
          type="button"
          className="mtl-inspector-toggle"
          onClick={() => setShowTrim(value => !value)}
        >
          <span>
            <ChevronDown size={15} />
            Inspector do clip
          </span>
          <small>{selected ? selectedMedia?.name : 'Nenhum clip seleccionado'}</small>
        </button>

        {showTrim && selected && selectedMedia && (
          <div className="mtl-trim-panel">
            <div className="mtl-trim-field">
              <label htmlFor="mtl-in">Entrada: {formatTime(selected.clip.sourceStart)}</label>
              <input
                id="mtl-in"
                type="range"
                min="0"
                max={Math.max(0.1, selectedMedia.duration || selected.clip.sourceEnd)}
                step="0.01"
                value={selected.clip.sourceStart}
                onChange={event => updateTrim('sourceStart', Number(event.target.value))}
                disabled={selected.track.locked}
              />
            </div>

            <div className="mtl-trim-field">
              <label htmlFor="mtl-out">Saída: {formatTime(selected.clip.sourceEnd)}</label>
              <input
                id="mtl-out"
                type="range"
                min={selected.clip.sourceStart + MIN_DURATION}
                max={Math.max(selected.clip.sourceEnd, selectedMedia.duration || selected.clip.sourceEnd)}
                step="0.01"
                value={selected.clip.sourceEnd}
                onChange={event => updateTrim('sourceEnd', Number(event.target.value))}
                disabled={selected.track.locked}
              />
            </div>

            <button
              type="button"
              onClick={resetTrim}
              disabled={selected.track.locked}
            >
              <RotateCcw size={14} /> Repor corte
            </button>
          </div>
        )}
      </div>

      <div className="mtl-footer">
        <span><Layers size={13} /> {tracks.length} pistas</span>
        <span>{tracks.reduce((sum, track) => sum + track.clips.length, 0)} clips na montagem</span>
        <span>Arrasta clips para outras pistas do mesmo tipo</span>
      </div>
    </section>
  )
}
