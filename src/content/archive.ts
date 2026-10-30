/** Every fragment is immutable; moving a splice never changes its testimony. */
export type FragmentId =
  "registro" | "chamado" | "eco" | "batente" | "mesa" | "aviso" | "fim";
export type Fragment = {
  id: FragmentId;
  label: string;
  text: string;
  verse: string;
  sound: string;
  front: string;
  back: string;
  hidden: string;
};
export const FRAGMENTS: Record<FragmentId, Fragment> = {
  registro: {
    id: "registro",
    label: "Papel de arroz",
    text: "Meu nome é Helena. Faço esta cópia para quem encontrar o arquivo. Primeiro, vou repetir o chamado que escutamos no corredor.",
    verse: "Quando a praça acende a brasa,",
    sound: "O motor ganha velocidade; não há voz antes desta entrada.",
    front:
      "Uma ponta clara, sem gravação, antecede a fala. Há uma emenda diagonal na outra extremidade.",
    back: "INÍCIO DE CÓPIA. A parte clara permite prender a fita no carretel.",
    hidden: "A emenda diagonal conserva metade da palavra CHAMADO.",
  },
  chamado: {
    id: "chamado",
    label: "Emenda verde",
    text: "Abram a porta. Estou sozinho. Venham me buscar. Era a voz do porteiro. Depois da última palavra, veio aquela tosse curta.",
    verse: "a janela empresta luz.",
    sound: "Duas pulsações roucas encerram a faixa. A segunda termina cortada.",
    front: "A entrada tem uma emenda diagonal coberta por adesivo verde.",
    back: "A fala citada não começa aqui: falta quem a apresentou.",
    hidden:
      "Sob o adesivo está a outra metade de CHAMADO. A mesma fibra atravessa as duas bordas.",
  },
  eco: {
    id: "eco",
    label: "Fibra de linho",
    text: "Mas o porteiro estava ao meu lado. Ele segurava uma barra de ferro. A voz atrás da porta repetiu até a mesma tosse. Ele levantou a barra.",
    verse: "Se o vento bater na casa,",
    sound:
      "A entrada completa a pulsação cortada. Depois, a mesma dupla de pulsações se repete.",
    front: "A fala começa por uma objeção. Um ruído cortado chega junto dela.",
    back: "A pessoa reconhecida pela voz estava à vista. A barra ainda não havia atingido nada.",
    hidden: "A margem registra: não cortar a tosse entre as duas tomadas.",
  },
  batente: {
    id: "batente",
    label: "Mancha de cobre",
    text: "A pancada da barra no corrimão fez a coisa recuar. Aproveitei para fechar a porta. O chamado ficou abafado do outro lado.",
    verse: "fecha a porta, apaga a luz.",
    sound:
      "Uma batida metálica baixa abre o trecho; o trinco fecha no final. Sua vibração continua além do corte.",
    front:
      "Um vinco atravessa a margem direita. A porta se fecha durante esta fala.",
    back: "É a primeira vez que o chamado fica abafado. Antes disso, a porta ainda estava aberta.",
    hidden:
      "O papel sobreposto esconde a anotação: conservar a cauda do trinco.",
  },
  mesa: {
    id: "mesa",
    label: "Borda de carvão",
    text: "Com a porta fechada, reuni os sobreviventes à mesa. Contei outra vez. Todos os que tinham saído do corredor estavam conosco.",
    verse: "Conta quem voltou da rua.",
    sound:
      "A entrada contém só a cauda da vibração do trinco, sem uma nova batida.",
    front:
      "O começo tem o restante de um vinco. A voz conta pessoas já reunidas.",
    back: "A contagem ocorreu depois do fechamento da porta e antes de escrever a advertência.",
    hidden:
      "A ponta colada revela a continuação do mesmo vinco da faixa do trinco.",
  },
  aviso: {
    id: "aviso",
    label: "Ponta encerada",
    text: "Depois da contagem, escrevi o aviso que deixo aqui: não obedeçam ao chamado que ouviram no começo. Guardem a cabeça como a encontraram.",
    verse: "Guarda um banco para a lua.",
    sound:
      "O lápis risca o papel. O motor continua rodando depois da advertência.",
    front:
      "Uma tira de papel sobreposta esconde uma linha manuscrita. Sua ponta está solta.",
    back: "O aviso responde à fala citada. A gravação ainda não terminou.",
    hidden:
      "A ordem para abrir foi uma citação. A advertência foi escrita depois que contamos os sobreviventes.",
  },
  fim: {
    id: "fim",
    label: "Líder vermelho",
    text: "Se uma voz conhecida pedir que abram, procurem primeiro a pessoa entre vocês. A cópia termina aqui. Helena.",
    verse: "A manhã é que conduz.",
    sound:
      "O motor perde velocidade e para. Depois desta cauda só existe fita clara.",
    front: "Uma ponta vermelha sem gravação termina o trecho.",
    back: "FIM DE CÓPIA. A fita clara fica presa ao carretel de recolhimento.",
    hidden:
      "Assinatura de Helena. Não há continuação depois do líder vermelho.",
  },
};
// Public inventory is intentionally not in narrative order.
export const IDS: FragmentId[] = [
  "chamado",
  "mesa",
  "fim",
  "eco",
  "aviso",
  "registro",
  "batente",
];
export const INITIAL: FragmentId[] = [...IDS];
export const HINTS = [
  "Os papéis claros nas pontas servem para prender a fita aos carretéis. Examine o verso das faixas que têm essas pontas.",
  "O chamado é uma citação. A faixa que o apresenta fica antes dele; a objeção sobre o porteiro vem depois. Compare também as duas metades da tosse.",
  "Prenda Papel de arroz no início e Líder vermelho no fim. Emenda verde liga à Fibra de linho; Mancha de cobre liga à Borda de carvão. O aviso foi escrito depois da contagem.",
];
export const REPORT = [
  "Registro de Helena, recolhido depois da interdição do pavilhão. Anexo à guarda da peça 7: cabeça de cervo em madeira articulada.",
  "Artur vestiu a cabeça durante a atração. Quando fomos buscá-lo, a passagem dos fundos já não levava ao pátio. Encontramos os azulejos do lavadouro, embora o lavadouro ficasse do outro lado da praça. A música continuava atrás das paredes.",
  "A figura chamava com vozes que conhecíamos. Uma delas era a do porteiro, que estava ao meu lado. Repetia a mesma frase e a mesma tosse. Artur, por sua vez, ainda tentava levar uma mão à correia da nuca. A outra puxava essa mão de volta. Foi assim que percebemos que ele continuava ali.",
  "A barra bateu no corrimão perto de sua cabeça. Ele largou o gancho e se protegeu. Na tentativa seguinte, combinamos o estrondo com a aproximação: enquanto um de nós mantinha as galhadas presas, os outros alcançaram as correias. O barulho nos deu tempo; não resolveu tudo sozinho.",
  "Quando tiramos a cabeça, Artur voltou a falar como Artur. A porta da rua reapareceu. Levamos os feridos para fora antes de mexer na madeira. Ninguém precisou vestir a peça outra vez.",
  "As dobradiças permitiam fechar o rosto sobre si mesmo. Dobramos as metades e prendemos a junção com ferro. Usamos seis grampos porque eram os que havia na oficina. Não contamos seis por costume, oração ou desenho. Precisávamos que a madeira permanecesse fechada.",
  "A peça foi guardada assim. Estes ferros não são reparos, enfeites ou proteção de transporte. Mantêm a prisão fechada. Não os retirem para restaurar a fantasia. A cabeça não deve ser aberta e ajustada ao rosto de ninguém.",
  "Deixo a sirene junto deste registro. Sons fortes e repentinos, de perto, fizeram a criatura se proteger; talvez lembre daquela noite. Não confundam isso com segurança. Tirem primeiro as pessoas. Guardem depois o que sobrou.",
  "Helena — sobrevivente da noite da interdição.",
];
