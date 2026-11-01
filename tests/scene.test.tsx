import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReactThreeTestRenderer, { act } from "@react-three/test-renderer";
import { useGame } from "../src/state/store";
import { useExplore } from "../src/state/exploration";
import type { FragmentId } from "../src/content/archive";
vi.mock("../src/scene/materials", async () => {
  const T = await import("three");
  return {
    metalMap: new T.Texture(),
    paperMap: new T.Texture(),
    iron: new T.MeshStandardMaterial(),
    darkIron: new T.MeshStandardMaterial(),
    brass: new T.MeshStandardMaterial(),
    boltMaterial: new T.MeshStandardMaterial(),
    labelTexture: () => new T.Texture(),
  };
});
import { ArchiveSafe } from "../src/scene/ArchiveSafe";
(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
vi.stubGlobal("self", {
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
});
beforeEach(() => {
  useExplore.getState().leave();
  useGame.getState().reset();
});
describe("grafo 3D e manipuladores reais (sem renderização GPU)", () => {
  it("monta sete faixas, seleciona por clique e oculta recompensas", async () => {
    const r = await ReactThreeTestRenderer.create(<ArchiveSafe />);
    expect(
      r.scene.findAll((n) => /^splice-\d$/.test(n.instance.name)),
    ).toHaveLength(7);
    await r.fireEvent(r.scene.findByProps({ name: "splice-3" }), "click");
    expect(useGame.getState().selected).toBe(3);
    expect(useGame.getState().workbench).toBe(true);
    expect(
      r.scene.findByProps({ name: "interior-rewards" }).instance.visible,
    ).toBe(false);
    await r.unmount();
  });
  it("só revela recompensas após o puxão manual de uma porta destrancada", async () => {
    const r = await ReactThreeTestRenderer.create(<ArchiveSafe />);
    const h = r.scene.findByProps({ name: "door-handle" }),
      capture = { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() };
    const event = (x: number) => ({
      nativeEvent: { clientX: x },
      target: capture,
      pointerId: 1,
    });
    await r.fireEvent(h, "pointerDown", event(500));
    await r.fireEvent(h, "pointerMove", event(340));
    expect(useGame.getState().phase).toBe("idle");
    await act(async () => {
      const a: FragmentId[] = [
        "registro",
        "chamado",
        "eco",
        "batente",
        "mesa",
        "aviso",
        "fim",
      ];
      for (let i = 0; i < 7; i++)
        useGame.getState().move(useGame.getState().order.indexOf(a[i]), i);
      useGame.getState().play(undefined, true);
      for (let i = 0; i < 7; i++) useGame.getState().next();
    });
    expect(
      r.scene.findByProps({ name: "interior-rewards" }).instance.visible,
    ).toBe(false);
    await r.fireEvent(h, "pointerDown", event(500));
    await r.fireEvent(h, "pointerMove", event(340));
    await r.fireEvent(h, "pointerUp", event(340));
    await r.advanceFrames(60, 1 / 60);
    expect(useGame.getState().phase).toBe("open");
    expect(
      r.scene.findByProps({ name: "door-pivot" }).instance.rotation.y,
    ).toBeLessThan(-1.8);
    expect(
      r.scene.findByProps({ name: "interior-rewards" }).instance.visible,
    ).toBe(true);
    expect(capture.releasePointerCapture).toHaveBeenCalled();
    await r.unmount();
  });
});
