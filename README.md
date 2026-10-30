# O Cofre da Água Morta

Minigame de horror psicológico para mesa de RPG. Um cofre industrial 3D com 16 módulos hidráulicos giratórios, água negra, manômetros físicos, alavanca, abertura manual e três recompensas narrativas.

## Publicar na Vercel

1. Extraia os arquivos deste ZIP.
2. Envie o conteúdo desta pasta para um repositório GitHub. `package.json`, `index.html` e `vercel.json` devem estar na raiz selecionada.
3. Importe o repositório na Vercel. Preset: **Vite**. Build: `npm run build`. Output: `dist`. Instalação: `npm ci`.
4. Faça o deploy. Não precisa de banco de dados, variáveis de ambiente ou conta de serviço de áudio.

O `vercel.json` já contém a configuração. O diretório `dist/` inclui a compilação pronta para hospedagens estáticas. Na Vercel, prefira publicar o código-fonte pela integração normal.

## Rodar no computador

Requer Node.js 22.12+ ou Node.js 24 e um navegador moderno com WebGL 2 e aceleração de hardware.

```sh
npm ci
npm run dev
```

Abra o endereço indicado no terminal. No Windows, pode executar `INICIAR_WINDOWS.bat` para fazer esses passos. Para verificar a versão de produção: `npm run build`, depois `npm run preview`.

Não abra `index.html` com duplo clique: módulos JavaScript precisam de um servidor HTTP.

## Jogar

- Inicie a inspeção. Um clique seleciona uma peça; outro clique a gira. Os botões inferiores giram nos dois sentidos.
- Arraste o fundo para inspecionar as laterais. Roda do mouse ou gesto de pinça aproxima a câmera.
- Toque nas chapas para ler as inscrições ampliadas.
- Acione a bomba pela alavanca 3D ou pelo botão inferior.
- Observe até onde a água realmente consegue chegar. Uma conexão incompatível interrompe o percurso e vaza naquela boca.
- Use as 16 peças sem deixar vazamentos para liberar a porta. Após a batida, arraste o puxador da direita para a esquerda. Há também um botão acessível que puxa a porta em pequenos incrementos.
- Dentro do cofre, inspecione a sirene, a planta e o relatório. Registre cada objeto no inventário da sessão.
- O menu `?` oferece três pistas progressivas, marcação opcional do primeiro vazamento e reinício com confirmação.
- Teclado: setas selecionam; `R` gira; `Shift + R` gira ao contrário; `Espaço` testa; `Esc` fecha a inspeção e solta a peça.

O progresso fica no armazenamento local do navegador, incluindo rotações, porta, pistas, volume e objetos registrados. Navegação anônima e limpeza dos dados do site podem apagar o progresso. Não há sincronização entre jogadores: para uma resolução conjunta, compartilhe a tela do mestre ou de um jogador.

## Conteúdo

Sirene de manivela com uma utilização relevante, croqui esquemático de passagem de manutenção (adaptável pelo mestre) e Relatório 08. Não há escopeta neste cofre. A sirene é apenas inspecionada: o site não toca um alarme alto.

## Validação

```sh
npm test
npm run build
```

Os testes cobrem lógica, persistência, reinício e integração da cena. A unicidade é verificada por enumeração dos domínios com poda segura de vazamentos e por uma segunda enumeração independente das rotas simples.

Veja `VALIDACAO.md` para o escopo e a limitação da verificação visual neste ambiente. `MESTRE_SPOILERS.md` contém o gabarito; não é importado pelo jogo nem servido pela compilação.

## Arquitetura

React + TypeScript + Vite; Three.js + React Three Fiber + Drei; estado em Zustand. Interpolação com amortecimento no loop de renderização, sem dependência adicional de GSAP.

- `src/logic/HydraulicGraphSolver.ts`: conectividade, primeira falha, percurso e enumeração.
- `src/state/`: máquina de estados e persistência.
- `src/scene/`: cofre, tubos, água, câmera, porta, manômetros e recompensas.
- `src/audio/SoundManager.ts`: ambiente e efeitos originais por síntese Web Audio.
- `src/ui/`: dicas, documentos, inspeção e comandos acessíveis.

Todos os tubos e mecanismos são meshes. As janelas e os documentos ampliados usam interface legível; a hidráulica acontece na cena 3D. O líquido utiliza geometria de tubo com preenchimento progressivo no sentido da conexão calculada, shader animado e bolhas confinadas ao caminho. Não é simulação volumétrica de fluidos.

## Recursos

Modelos, texturas de desgaste e áudio originais/procedurais, sem downloads externos em tempo de jogo. Fontes empacotadas localmente. Consulte `CREDITOS_E_REFERENCIAS.md`.
