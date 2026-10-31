# Validação — O Arquivo da Água Morta

Verificação em 30/10/2026. Fluxo: selecionar e examinar faixas → reorganizar → reproduzir/conferir → liberar ferrolho → abrir manualmente → inspecionar e registrar recompensas. Não há backend ou chamadas externas de áudio durante o jogo.

## Testes automáticos

`npm test`: **18 testes passaram** (Vitest).

- Enumeração das 5.040 permutações: uma montagem aceita. As justificativas das relações estão no gabarito; a enumeração não substitui a análise das pistas.
- Estados incompletos, peças duplicadas/inventadas e trocas de vizinhos rejeitados.
- Movimentos preservam os sete fragmentos e o conteúdo fixo.
- Preview e trecho isolado não destrancam; conferência correta destranca, mas não abre sozinha.
- Pausa bloqueia avanço; parar e resetar cancelam a reprodução; movimento bloqueado durante leitura.
- Porta, inspeção e coleta bloqueadas antes da abertura.
- Persistência de montagem, descobertas, volume, mudo, porta e inventário; saves antigos, corrompidos ou com desbloqueio incompatível são ignorados/sanitizados.
- Falha de armazenamento não derruba a partida.
- Grafo 3D com sete faixas selecionáveis; manipulador real da porta com captura/liberação de ponteiro e recompensas ocultas até a abertura.

`npm run build`: TypeScript e Vite concluíram. Bundle principal aproximadamente 1,24 MB / 352 KB gzip, além de fontes locais e aproximadamente 650 KB de faixas de áudio. A matriz original em `assets/` não vai para `dist/`.

## Navegador

Script reproduzível: `scripts/browser-check.mjs`. Instale opcionalmente `@playwright/test@1.51.1` sem salvar dependência e Chromium (`npx playwright install chromium`); execute `node scripts/browser-check.mjs`. O script inicia seu próprio servidor local. `BROWSER_EXECUTABLE` aceita um executável já instalado; `MOBILE_ONLY=1` executa apenas a etapa móvel.

Percurso desktop executado em Chromium headless com SwiftShader, 1440 × 1000:

- Cena WebGL realmente renderizada; capturas da cena e bancada inspecionadas visualmente.
- Virar o suporte e levantar adesivo revelaram a anotação.
- Montagem inicial rejeitada com feedback; pausa e retomada funcionaram.
- Reordenação por teclado, arraste e botões levou à montagem correta.
- Recarregamento preservou a montagem e a descoberta sob adesivo.
- Um MP3 real tocou até o fim; legenda mudou do depoimento para o verso e terminou sem mensagem de fallback.
- Solução em silêncio usando o avanço de faixas; ferrolho liberado e porta aberta manualmente.
- Relatório novo, coleta, restauração de cofre aberto, inspeção da sirene e croqui; reinício removeu o progresso.

Etapa móvel executada separadamente em viewport 390 × 844 com emulação de toque: volume por controle de faixa, abertura da bancada, ausência de overflow horizontal, mover por botão, virar e revelar emenda. Capturas da bancada e do verso foram inspecionadas. A primeira execução com duas páginas WebGL simultâneas excedeu o timeout; o script agora fecha a página desktop antes de abrir a móvel.

## Limites concretos

- Renderização por software não mede desempenho em GPU real. Não foi feito teste em aparelho celular físico, Safari ou Firefox.
- Os MP3 são voz sintética em português; a cantiga é recitada. A reprodução e as transições de legenda foram verificadas tecnicamente, sem avaliação humana de interpretação vocal.
- Legendas sincronizam por trecho (depoimento/verso), não palavra por palavra. Tosse e trinco são efeitos discretos sintetizados; todos os vestígios também aparecem por escrito.
- Nenhum playtest com grupo real foi realizado: duração de 10–20 minutos e dificuldade são metas, não medidas.
- O mapa preserva a saída de serviço para a mata do projeto anterior; o mestre deve adaptar esse croqui à geografia da sessão.
- O gabarito não integra o build, mas o código cliente pode ser inspecionado. Não há validação competitiva em servidor.
- Não houve merge nem comando de deploy de produção.

## Atualização 2.1 — exploração e símbolos (31/10/2026)

`npm test`: **27 testes passaram**. Os nove novos cobrem limites da sala, deslizamento, passos grandes, porta aberta, proximidade/direção, descobertas sem destrancar o cofre, revisão restrita ao que foi descoberto, salvamento/sanitização de teorias e falha de armazenamento.

`npm run build`: TypeScript e Vite passaram. Bundle principal aproximadamente 1,25 MB / 358 KB gzip. Marcas SVG são geradas localmente; não há novas dependências de execução nem downloads de imagens externas.

Fontes do Notion e distinção entre cânone e colocação autoral estão em `SEGREDOS_DO_DEPOSITO.md`. O caderno não valida teorias, não executa texto digitado e não transforma símbolos em senha.

Script de verificação: `scripts/exploration-check.mjs`. Usa teclas reais para visitar os objetos e lê a câmera apenas para verificar posições, sem teletransportá-la. Inclui arraste para olhar, pausa de movimento em diálogos, caderno, retorno ao puzzle, recarga e toque móvel. Execução concluída em Chromium headless com SwiftShader: os seis segredos foram alcançados andando; arraste para olhar, pausa em diálogos, seis desenhos e duas comparações no caderno, persistência após recarga e retorno às sete emendas passaram sem erros de página. Em viewport móvel 390 × 844, movimento por toque, edição do caderno, retorno ao cofre e ausência de overflow horizontal passaram. Capturas desktop e móvel foram inspecionadas visualmente. Depois, foi separado o aviso do botão no caderno móvel e elevada a marca da bacia em 2 cm para evitar sobreposição com a água. Não houve medição em GPU real ou celular físico.
