# Validação e limites

## Implementado e verificado automaticamente

- Rotações funcionais: duas para retos; quatro para curvas.
- Distribuição exata de tipos e caminho do anexo preservados.
- Cada peça inicia em orientação diferente da solução.
- Água só atravessa portas compatíveis e para na primeira falha.
- Nenhum percurso parcial ou ciclo isolado é aceito.
- Conjunto completo de 16 módulos necessário para liberar a porta.
- Unicidade comprovada de duas formas independentes.
- Salvamento/restauração, validação de dados corrompidos, reinício.
- Bloqueio da porta e das recompensas antes da resolução.
- Integração dos meshes 3D com os manipuladores de clique e arraste.
- Simulação temporal de falha, ressonância, destravamento e abertura por puxão.
- Montagem da cena em configurações de 390 × 844 e 1366 × 768.
- Compilação TypeScript e build Vite.

## Prova de unicidade

Existem dez curvas e seis retos: `4^10 × 2^6 = 67.108.864` combinações funcionais possíveis.

O enumerador usa os domínios completos e poda somente orientações que necessariamente vazam na borda ou não correspondem a um vizinho já atribuído. Essa poda é exata: nenhuma solução válida pode estar em uma subárvore descartada. Ao finalizar uma atribuição sem vazamentos, o solver exige o percurso entrada → 16 módulos distintos → retorno. A busca faz 52 atribuições de orientação após a poda e encontra uma única solução.

O segundo teste não usa o enumerador nem a função de portas: gera recursivamente todas as rotas simples a partir da entrada, respeitando reta/curva e as bordas, e conta as que terminam no retorno após 16 módulos. Encontra a mesma única rota.

Não há gabarito ou botão de resolver na interface. O código cliente pode sempre ser inspecionado por um jogador com conhecimento técnico; este não é um jogo competitivo com validação em servidor.

## Limitação observada no teste de navegador

O navegador remoto carregou a aplicação, mas o Chrome deste ambiente informou que o contexto WebGL não pôde ser criado (`GL_RENDERER = Disabled`). A aplicação apresentou a mensagem de recuperação prevista para ausência de WebGL.

Por esse motivo, não foi possível confirmar aqui a renderização visual final, o desempenho real, a experiência de toque em hardware móvel ou uma partida visual completa. Os testes da cena usam o React Three Test Renderer com contexto simulado e texturas substituídas apenas durante os testes. Eles verificam árvore de objetos, geometrias, eventos e estados; não validam pixels, shaders compilados pela GPU ou taxa de quadros.

Nenhuma captura simulada é apresentada como prova de funcionamento. Antes de usar na sessão, execute em navegador com WebGL 2, confira uma tentativa com vazamento e teste a abertura com o gabarito separado.
