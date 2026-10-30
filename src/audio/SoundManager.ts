/** Original procedural audio. No samples, remote assets, or loud siren. */
class SoundManager {
 ctx:AudioContext|null=null;master:GainNode|null=null;ambient:GainNode|null=null;volume=.45;
 async start(){if(typeof AudioContext==='undefined')return;if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=this.volume*.23;this.master.connect(this.ctx.destination);this.ambient=this.ctx.createGain();this.ambient.gain.value=.18;this.ambient.connect(this.master);
 for(const f of [43,66.15,88.3]){const o=this.ctx.createOscillator();const g=this.ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.18;o.connect(g).connect(this.ambient);o.start();}
 const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*4,this.ctx.sampleRate),d=buffer.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){last=(last+Math.random()*.12-.06)/1.03;d[i]=last;}
 const n=this.ctx.createBufferSource();n.buffer=buffer;n.loop=true;const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=480;n.connect(filter).connect(this.ambient);n.start();
 const lfo=this.ctx.createOscillator();const lg=this.ctx.createGain();lfo.frequency.value=.14;lg.gain.value=.07;lfo.connect(lg).connect(this.ambient.gain);lfo.start();}
 await this.ctx.resume();}
 setVolume(v:number){this.volume=v;if(this.master&&this.ctx)this.master.gain.setTargetAtTime(v*.23,this.ctx.currentTime,.1);}
 tone(f:number,duration:number,gain=.3,type:OscillatorType='sine',end=30){if(!this.ctx||!this.master)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(this.master);o.start();o.stop(t+duration);}
 gear(){this.tone(175,.14,.2,'triangle',65);this.tone(725,.07,.06,'square',330);}
 pump(){this.tone(83,1.3,.4,'sawtooth',44);}
 leak(){this.tone(430,.8,.15,'sawtooth',70);}
 unlock(){this.tone(37,3,.7);setTimeout(()=>this.tone(92,.25,.5,'triangle',31),1300);}
 door(){this.tone(110,1.8,.3,'sawtooth',23);}
 knock(){this.tone(55,.34,.8,'triangle',21);}
}
export const sound=new SoundManager();
