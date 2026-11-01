# O Arquivo da Água Morta

Minigame 3D de horror investigativo para a aventura de Caer Siddi. Sete fragmentos fixos de uma gravação adulterada precisam ser reorganizados. Depoimento, emendas, vestígios sonoros e uma cantiga permitem recuperar o aviso de Helena.

## Rodar

Node.js 22.12+ ou 24 e navegador moderno com WebGL 2.

```sh
npm ci
npm run dev
```

Abra o endereço indicado. O atalho `INICIAR_WINDOWS.bat` continua disponível. Se o ambiente restringir a enumeração de interfaces de rede, use `npm run dev -- --host 127.0.0.1`.

```sh
npm test
npm run build
npm run preview
```

Não abra o HTML diretamente pelo gerenciador de arquivos.

## Jogar

1. Use **Puzzle principal** para entrar na vista do cofre e examine as sete emendas pelo aparelho ou pelo botão.
2. Selecione uma faixa para ler a fala, o verso da cantiga e os vestígios. Vire o suporte e levante a ponta de adesivo quando quiser investigar a anotação.
3. Reorganize arrastando ou com **Mover antes/depois**. As palavras não mudam de posição secretamente.
4. **Ouvir só esta** e **Ouvir montagem** são prévias. **Conferir cópia** testa o ferrolho ao terminar a leitura. Pausa, parar e próxima faixa estão disponíveis; avançar é permitido também em silêncio.
5. Após a montagem correta, puxe o manípulo para a esquerda ou use **Puxar porta**. Inspecione e registre sirene, croqui e relatório.

Teclado: Tab percorre comandos; Enter ativa botões; ↑/↓ selecionam; Alt+↑/↓ movem; Espaço reproduz/pausa fora de botões e campos; Esc fecha diálogos. Há três dicas progressivas em Ajuda. Volume e mudo ficam no cabeçalho, inclusive no celular. Nenhum alarme alto é tocado.

O progresso é local: montagem, descobertas sob emendas, dicas, volume, mudo, abertura e inventário. A versão 2 usa uma chave própria e ignora saves hidráulicos antigos. Sem armazenamento disponível, a partida continua com aviso. Não há sincronização entre jogadores: compartilhe uma tela para jogar em grupo.

## Exploração e segredos

O site abre diretamente no passeio. O botão **Puzzle principal**, no canto superior, entra na vista de inspeção do cofre; **Explorar a sala** retorna ao passeio sem perder a montagem. Também é possível aproximar-se do cofre e usar **E · Examinar o cofre**. WASD anda, arrastar olha, ↑/↓ andam e ←/→ giram. **E** ou o botão central examina objetos próximos e à frente. No celular, mantenha os botões de movimento pressionados e arraste a cena para olhar. Não exige captura do mouse. **Esc** fecha uma observação.

O depósito contém cinco vestígios inspirados no Notion da campanha e um easter egg. **Caderno** reúne apenas os desenhos já revelados, oferece comparações observáveis e um espaço de até 2.000 caracteres para suas teorias. As anotações são salvas neste navegador. A posição não é salva; cada visita começa no centro da sala.

Colisões cobrem paredes e móveis. Movimento pausa ao examinar objetos ou escrever no caderno. O mapa explorável é este depósito; não inclui todas as áreas da one-shot.

Fontes, limites de cânone e localizações dos segredos estão em `SEGREDOS_DO_DEPOSITO.md`, somente para o mestre, fora do build. Não consulte esse arquivo se quiser descobri-los jogando.

## Vercel

O projeto já contém `vercel.json`. Importe este repositório com preset **Vite**, instalação `npm ci`, build `npm run build`, saída `dist`. Não exige banco, variáveis de ambiente ou API de voz durante a partida. A branch `main` publica no domínio principal. Para revisar uma alteração antes da publicação, use o ambiente Preview da branch `codex/arquivo-agua-morta`.

Os MP3 e fontes estão no próprio projeto. O MP3 original de edição fica em `assets/`, fora do diretório público. Não é necessário regenerar áudio para construir o site.

## Arquitetura

- `src/content/archive.ts`: falas fixas, cantiga, vestígios, dicas e relatório.
- `src/logic/ArchiveSolver.ts`: validação por relações entre evidências.
- `src/state/`: estado da partida, transporte de áudio e persistência defensiva.
- `src/audio/ArchivePlayer.tsx`: reprodução local, legenda por trecho e relógio de fallback.
- `src/scene/`: aparelho, cofre, câmera, porta e objetos 3D.
- `src/ui/`: bancada ampliada, inspeção, controles, transcrições e inventário.
- `scripts/prepare_audio.py`: recorte e mixagem reproduzíveis com Python e FFmpeg.

A solução física é um copiador de fita magnética com manivela de acionamento, roletes, cabeçote e suportes de emenda removíveis. A manivela governa o mecanismo ficcional; não é preciso girá-la continuamente. A bancada ampliada usa HTML para garantir leitura e operação por teclado. O conjunto e a inspeção da sirene são 3D.

`MESTRE_SPOILERS.md` contém solução e justificativas; não tem link na interface nem importação no build. O cliente e seus critérios continuam inspecionáveis. `VALIDACAO.md` informa os testes executados e limites. A duração de 10–20 minutos é uma meta para grupo, ainda sem medição com jogadores.
