import { IDS, type FragmentId } from "../content/archive";
export const isOrder = (value: unknown): value is FragmentId[] =>
  Array.isArray(value) &&
  value.length === IDS.length &&
  new Set(value).size === IDS.length &&
  value.every((x) => IDS.includes(x));
export type Verdict = { success: boolean; message: string };
/** Constraints exposed by the physical leaders, audio joins and testimony; no numeric code. */
export function solve(order: unknown): Verdict {
  if (!isOrder(order))
    return {
      success: false,
      message: "Há uma faixa ausente ou repetida. Reponha as sete faixas.",
    };
  const at = (id: FragmentId) => order.indexOf(id);
  if (order[0] !== "registro" || order[6] !== "fim")
    return {
      success: false,
      message:
        "O aparelho encontra gravação fora dos líderes. Examine as pontas claras e os versos das faixas.",
    };
  if (at("chamado") !== at("registro") + 1)
    return {
      success: false,
      message:
        "Helena anuncia um chamado, mas a próxima faixa não o reproduz. Escute essa emenda.",
    };
  if (at("eco") !== at("chamado") + 1)
    return {
      success: false,
      message:
        "Uma pulsação rouca termina cortada. Sua continuação ficou longe do chamado.",
    };
  if (at("eco") > at("batente"))
    return {
      success: false,
      message:
        "A barra atinge o corrimão antes de alguém levantá-la. Compare as duas falas.",
    };
  if (at("mesa") !== at("batente") + 1)
    return {
      success: false,
      message:
        "O trinco vibra de um lado do corte, mas sua cauda não está do outro. Compare as bordas.",
    };
  if (at("aviso") < at("mesa"))
    return {
      success: false,
      message: "A advertência menciona uma contagem que ainda não foi ouvida.",
    };
  return {
    success: true,
    message:
      "A citação voltou ao seu lugar. O aviso está inteiro. O ferrolho cedeu.",
  };
}
export function move(
  order: FragmentId[],
  from: number,
  to: number,
): FragmentId[] {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    from >= 7 ||
    to < 0 ||
    to >= 7
  )
    return order;
  const next = [...order];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
