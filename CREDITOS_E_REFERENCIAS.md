# Créditos e proveniência

- Cofre, aparelho de fita, sirene, parafusos, tubulações ambientais e papéis: geometrias procedurais em Three.js. O novo mecanismo substitui os 16 módulos hidráulicos.
- Metal, concreto, papel e inscrições: texturas Canvas locais. Fontes Cormorant Garamond e IBM Plex Mono empacotadas via Fontsource; licenças em `licenses/`.
- React, Vite, TypeScript, Three.js, React Three Fiber, Drei e Zustand: dependências existentes; licenças nos pacotes e em `licenses/`.
- Texto da gravação, cantiga e relatório: conteúdo autoral para este projeto. Fatos da ocorrência da máscara fornecidos no briefing e consultados no Notion do RPG. Acréscimos de cena identificados no gabarito.
- Ambiente e respostas do aparelho: síntese Web Audio. Tosse representada por pulsações roucas discretas, trinco, lápis e motor: síntese offline incorporada aos MP3. Não são amostras gravadas de objetos reais.

## Voz

Voz sintética em português, gerada via ferramenta de narração HeyGen em 30/10/2026. Não é voz de Helena como pessoa real nem atuação humana gravada para o projeto. A cantiga é **recitada**, não cantada, em volume menor entre os trechos. Não há clonagem de voz fornecida por uma pessoa.

- Identificador da voz do catálogo: `1803df59c37443789d2e4f71c82859a0`.
- Pedido: `735c34906c664dfba67225668e435593`.
- Engine solicitado: `heygen_voice`; engine informado na resposta: `orca`.
- Matriz: `assets/narration-source.mp3`, fora dos arquivos públicos.
- Recortes e efeitos: `scripts/prepare_audio.py`; execute `python scripts/prepare_audio.py assets/narration-source.mp3` com FFmpeg e ffprobe disponíveis.
- Roteiro falado: `text` de cada fragmento em `src/content/archive.ts`, na ordem do gabarito, seguido pelos sete versos na mesma ordem. Marcadores de tempo vieram da resposta de narração.

A matriz preserva a origem do áudio e permite refazer os recortes. Nenhuma chamada ao serviço é feita durante a partida. A voz gerada não é apresentada como recurso CC0; sua utilização segue os termos do serviço de origem.

Silent Hill e jogos semelhantes foram referências de relação entre objeto, narrativa e dedução. Nenhuma fala, melodia, modelo, textura, personagem ou puzzle específico desses jogos foi incorporado.
