"""Build embedded clips from the single authorized synthetic narration. Run with original MP3 path.
Source: HeyGen voice 1803df59c37443789d2e4f71c82859a0, requested heygen_voice, returned orca.
Request 735c34906c664dfba67225668e435593. Phrase boundaries from returned word timestamps.
No pitch/speed changes. The cantiga is recited, not sung.
"""
import sys,subprocess,json,pathlib,re
source=sys.argv[1]
root=pathlib.Path(__file__).resolve().parents[1]
ids=['registro','chamado','eco','batente','mesa','aviso','fim']
speech=[(0,7.86),(7.86,16.42),(16.42,25.17),(25.17,32.51),(32.51,41.00),(41.00,49.88),(49.88,57.42)]
verses=[(57.47,59.21),(59.21,60.96),(60.96,62.66),(62.66,64.84),(64.84,66.80),(66.80,68.73),(68.73,70.6351)]
manifest={}
for id,(a,b),(c,d) in zip(ids,speech,verses):
 # Quiet lead/tail provides non-speech space for optional mechanical emenda cues.
 f=f'[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,highpass=f=90,lowpass=f=6500,afade=t=in:d=0.02,afade=t=out:st={b-a-.035}:d=0.03,adelay=350,apad=pad_dur=0.45[s];[0:a]atrim=start={c}:end={d},asetpts=PTS-STARTPTS,volume=0.65,afade=t=in:d=0.02,apad=pad_dur=0.6[v];[s][v]concat=n=2:v=0:a=1[out]'
 subprocess.run(['ffmpeg','-v','error','-y','-i',source,'-filter_complex',f,'-map','[out]','-ar','22050','-ac','1','-b:a','64k',str(root/'public/audio'/f'{id}.mp3')],check=True)
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(root/'public/audio'/f'{id}.mp3')]))
 manifest[id]={'duration':round(duration,3),'speechStart':.35,'speechEnd':round(.35+b-a,3),'verseStart':round(.8+b-a,3),'verseEnd':round(.8+b-a+d-c,3)}
(root/'src/content/audioTiming.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))

# Original, quiet Foley cues, synthesized offline and embedded in the files.
# A single waveform is cut across each matching boundary (no random new cue).
import math, random, wave, array, tempfile
rate=22050
rng=random.Random(7)
def rough(t):
 return .085*math.sin(math.pi*min(1,t/.20))*(math.sin(2*math.pi*93*t)+.28*math.sin(2*math.pi*173*t)) if 0<=t<=.20 else 0
def latch(t):
 return .10*math.exp(-8*t)*(math.sin(2*math.pi*670*t)+.35*math.sin(2*math.pi*1141*t)) if t>=0 else 0
with tempfile.TemporaryDirectory() as tmp:
 for id in ids:
  path=root/'public/audio'/f'{id}.mp3'
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','s16le','-ac','1','-ar',str(rate),'-'])
  samples=array.array('h',raw);dur=len(samples)/rate
  for i in range(len(samples)):
   t=i/rate;tail=dur-t;cue=0
   # Low motor tone, fades in/out at the clear leaders.
   gain=min(1,t/.3) if id=='registro' else min(1,tail/.5) if id=='fim' else 1
   cue+=.006*gain*math.sin(2*math.pi*(48*t if id!='fim' else 48*t-7*max(0,t-dur+.5)**2))
   if id=='chamado':cue+=rough(t-(dur-.48))+rough(t-(dur-.10))
   if id=='eco':cue+=rough(t+.10)+rough(t-.8)+rough(t-1.18)
   if id=='batente':cue+=latch(t)*.6+latch(t-(dur-.08))
   if id=='mesa' and t<.32:cue+=latch(t+.08)
   if id=='aviso' and t<.3:cue+=rng.uniform(-.018,.018)*math.sin(math.pi*t/.3)**2
   samples[i]=round(max(-.95,min(.95,samples[i]/32768+cue))*32767)
  wav=pathlib.Path(tmp)/'mix.wav'
  with wave.open(str(wav),'wb') as w:w.setparams((1,2,rate,len(samples),'NONE','not compressed'));w.writeframes(samples.tobytes())
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-b:a','64k',str(path)],check=True)
print('Foley embedded: motor, split rough pulses, split latch, pencil. All cues also transcribed.')
