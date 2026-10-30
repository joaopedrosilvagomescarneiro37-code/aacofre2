import React from 'react';
import { describe,it,expect,vi,beforeEach } from 'vitest';
import ReactThreeTestRenderer,{act} from '@react-three/test-renderer';
import * as THREE from 'three';
import { useGame } from '../src/state/store';
import { TYPES } from '../src/logic/HydraulicGraphSolver';
// Test scene graph and real pointer handlers without pretending this is a GPU render.
vi.mock('../src/scene/materials',async()=>{const T=await import('three');const map=new T.Texture();return {metalMap:map,concreteMap:map,paperMap:map,iron:new T.MeshStandardMaterial(),darkIron:new T.MeshStandardMaterial(),brass:new T.MeshStandardMaterial(),rust:new T.MeshStandardMaterial(),boltMaterial:new T.MeshStandardMaterial(),labelTexture:()=>new T.Texture(),gaugeTexture:()=>new T.Texture()};});
import { HydraulicSafe } from '../src/scene/HydraulicSafe';
(globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
vi.stubGlobal('self',{requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}});
beforeEach(()=>{useGame.getState().reset();});
const ANSWER=[2,1,1,2,0,0,1,3,0,3,0,2,1,1,1,3];
describe('Integração da cena 3D, ponteiros e simulação (sem GPU)',()=>{
 it('monta 16 peças em meshes 3D, seleciona e gira pelo manipulador de clique',async()=>{
  const renderer=await ReactThreeTestRenderer.create(<HydraulicSafe/>);
  const pieces=renderer.scene.findAll(n=>/^module-\d+$/.test(n.instance.name));expect(pieces).toHaveLength(16);
  const hit=renderer.scene.findByProps({name:'module-hit-0'});await renderer.fireEvent(hit,'click');expect(useGame.getState().selected).toBe(0);const before=useGame.getState().rotations[0];await renderer.fireEvent(hit,'click');expect(useGame.getState().rotations[0]).toBe((before+1)%4);
  await renderer.advanceFrames(60,1/60);const rotor=renderer.scene.findByProps({name:'pipe-rotor-0'});expect(Math.abs(rotor.instance.rotation.z+Math.PI/2)).toBeLessThan(.03);await renderer.unmount();
 });
 it('cada clique horário num reto continua girando no mesmo sentido',async()=>{const r=await ReactThreeTestRenderer.create(<HydraulicSafe/>);const hit=r.scene.findByProps({name:'module-hit-2'});await r.fireEvent(hit,'click');await r.fireEvent(hit,'click');await r.advanceFrames(50,1/60);const rotor=r.scene.findByProps({name:'pipe-rotor-2'});const first=rotor.instance.rotation.z;await r.fireEvent(hit,'click');await r.advanceFrames(50,1/60);expect(rotor.instance.rotation.z).toBeLessThan(first-1.5);await r.unmount();});
 it('a alavanca falha, mantém a porta trancada e não cria água em peças não alcançadas',async()=>{const r=await ReactThreeTestRenderer.create(<HydraulicSafe/>);const now=vi.spyOn(performance,'now');now.mockReturnValue(1000);await r.fireEvent(r.scene.findByProps({name:'pump-hit'}),'click');now.mockReturnValue(4000);await act(async()=>{await r.advanceFrames(2,1/60);});expect(useGame.getState().phase).toBe('failure');expect(r.scene.findAll(n=>n.instance.name.startsWith('water-'))).toHaveLength(0);expect(r.scene.findByProps({name:'door-pivot'}).instance.rotation.y).toBe(0);now.mockRestore();await r.unmount();});
 it('percurso inteiro pressuriza, destrava, aceita o puxão e revela os três objetos',async()=>{
  const r=await ReactThreeTestRenderer.create(<HydraulicSafe/>);await act(async()=>{for(let i=0;i<16;i++){while(useGame.getState().rotations[i]!==ANSWER[i])useGame.getState().turn(i);}});
  const now=vi.spyOn(performance,'now');now.mockReturnValue(1000);await r.fireEvent(r.scene.findByProps({name:'pump-hit'}),'click');now.mockReturnValue(9000);await act(async()=>{await r.advanceFrames(2,1/60);});expect(useGame.getState().phase).toBe('resonance');expect(r.scene.findAll(n=>n.instance.name.startsWith('water-'))).toHaveLength(16);
  now.mockReturnValue(14500);await act(async()=>{await r.advanceFrames(2,1/60);});expect(useGame.getState().phase).toBe('unlocked');
  const handle=r.scene.findByProps({name:'door-handle'});const capture={setPointerCapture:()=>{},releasePointerCapture:()=>{}};
  await r.fireEvent(handle,'pointerDown',{nativeEvent:{clientX:500},target:capture,pointerId:1});await r.fireEvent(handle,'pointerMove',{nativeEvent:{clientX:340},target:capture,pointerId:1});await r.fireEvent(handle,'pointerUp',{nativeEvent:{clientX:340},target:capture,pointerId:1});await r.advanceFrames(60,1/60);
  expect(useGame.getState().phase).toBe('open');expect(r.scene.findByProps({name:'door-pivot'}).instance.rotation.y).toBeLessThan(-1.8);expect(r.scene.findByProps({name:'interior-rewards'}).instance.visible).toBe(true);expect(useGame.getState().doorDragging).toBe(false);now.mockRestore();await r.unmount();
 });
 it.each([[390,844],[1366,768]])('monta a cena nas dimensões %i × %i',async(width,height)=>{const r=await ReactThreeTestRenderer.create(<HydraulicSafe/>,{width,height});expect(r.scene.findAll(n=>/^module-hit-\d+$/.test(n.instance.name))).toHaveLength(16);expect(r.scene.findAll(n=>(n.instance as THREE.Mesh).isMesh).length).toBeGreaterThan(200);await r.unmount();});
});
