import render as r
import json,subprocess,concurrent.futures,math
from PIL import Image
from pathlib import Path
D=json.loads((r.ROOT/'timeline.json').read_text());S=D['scenes'];TOTAL=sum(s['duration'] for s in S);FPS=24

def chunk(bounds):
 a,b=bounds;images={s['image']:Image.open(r.ROOT/s['image']).convert('RGB') for s in S[max(0,a-1):b]};bases=[r.build_static(s,i,len(S)) if max(0,a-1)<=i<b else None for i,s in enumerate(S)]
 elapsed=sum(s['duration'] for s in S[:a]);previous=None
 if a:
  p=S[a-1];previous=r.render_frame(p,a-1,len(S),p['duration']-1/FPS,elapsed-p['duration'],TOTAL,images,bases)
 out=r.ROOT/f'chunk-{a:03d}.mp4';proc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-threads','1',str(out)],stdin=subprocess.PIPE)
 for i in range(a,b):
  s=S[i]
  for n in range(round(s['duration']*FPS)):
   im=r.render_frame(s,i,len(S),n/FPS,elapsed,TOTAL,images,bases)
   if previous is not None and n<round(.22*FPS):im=Image.blend(previous,im,r.smooth(n/(.22*FPS)))
   proc.stdin.write(im.tobytes())
  previous=im.copy();elapsed+=s['duration'];print(f'{i+1}/{len(S)}',flush=True)
 proc.stdin.close()
 if proc.wait():raise RuntimeError('encoder failed')
 return str(out)
if __name__=='__main__':
 size=math.ceil(len(S)/4);ranges=[(i,min(i+size,len(S))) for i in range(0,len(S),size)]
 with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:files=list(pool.map(chunk,ranges))
 listing=r.ROOT/'concat.txt';listing.write_text(''.join("file '"+p+"'\n" for p in files))
 subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(r.ROOT/'bolig-a-til-aa-v13.mp4')],check=True)
 print('DONE',TOTAL,flush=True)
