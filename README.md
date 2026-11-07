# Studio — Audio & Video

Estúdio audiovisual pessoal, mobile-first, com interface Dark Studio e arquitetura local-first.

## Estado desta versão

Esta é a fundação funcional `0.1.0`, não um editor profissional completo.

Já inclui:
- Interface responsiva mobile-first.
- Criação e listagem de projetos.
- Armazenamento local de projetos e ficheiros importados com IndexedDB.
- Importação de áudio, vídeo e imagens.
- Pré-visualização/reprodução de ficheiros compatíveis com o navegador.
- Biblioteca de mídia e organização visual inicial da timeline.
- Manifesto PWA e configuração de service worker.

Ainda não inclui:
- Edição real de clips (corte, divisão, arrasto e sincronização).
- Mixer, equalizador, compressor, reverb ou automação.
- Renderização/exportação de áudio e vídeo.
- Suporte universal a codecs.
- Sincronização na nuvem.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Executar localmente

```bash
npm install
npm run dev
```

Abre o endereço apresentado pelo Vite.

## Verificar e compilar

```bash
npm run typecheck
npm run build
npm run preview
```

## Publicar

Pode ser publicado em serviços estáticos compatíveis com Vite, como GitHub Pages ou Netlify. Para instalar como PWA, publica em HTTPS.

## Privacidade e armazenamento

Os projetos e ficheiros importados são guardados no armazenamento local do navegador (IndexedDB) neste dispositivo e neste perfil do navegador. Limpar os dados do navegador pode apagar esses ficheiros. Esta versão ainda não tem backup automático na nuvem; mantém cópias originais dos teus ficheiros.

## Arquitetura planeada

- `features/audio-editor`: edição e ferramentas de áudio.
- `features/video-editor`: edição de vídeo.
- `engine/audio`: Web Audio API e AudioWorklet.
- `engine/video`: WebCodecs e pipeline de renderização.
- `engine/timeline`: modelo de sequências, pistas, clips e keyframes.
- `engine/workers`: tarefas pesadas fora da thread da interface.
- `storage`: IndexedDB/OPFS e gestão de projetos.

## Desenvolvimento

Trabalhar por módulos pequenos. Cada módulo deve ter testes e uma função demonstrável antes de se avançar para o seguinte.
