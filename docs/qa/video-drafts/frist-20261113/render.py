"""Render review-only film from unaltered sandbox screenshots; no app publication.

Requires Pillow and ffmpeg. Run from any directory. Each scene is numbered by
the renderer. One identical pointer indicates verified visible content; no
click rings or simulated clicks. Sources and captions remain reviewable.
"""
from pathlib import Path
import json, subprocess, textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
W, H, FPS, SECONDS = 1920, 1080, 24, 12
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
scenes = [
    dict(image='01-alle-bygg.jpg', title='Kontroller hver bolig',
         text='Åpne Oppsett → Bygg og boliger → Beboerlenker og frister samlet. Les fristen på hver bolig.',
         note='Et byggfilter endrer ikke fristene.', pointer=[710, 596]),
    dict(image='02-bolig38.jpg', title='Ett individuelt unntak',
         text='Bolig 38 har fått 22. november. De andre boligene i bygg B har fortsatt ingen frist.',
         note='Bare den valgte boligen ble endret.', pointer=[710, 427]),
    dict(image='03-avtalesvar.jpg', title='En annen svarfrist',
         text='Avtalen har sin egen svarfrist: 13. desember. Den endres ikke når du setter bestillingsfristen.',
         note='Syntetisk avtale i sandbox. Ingen ordre eller e-post er sendt.', pointer=[510, 670]),
]

def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size)

def wrapped(draw, text, xy, width, size, fill, bold=False, line=1.35):
    words = text.split(); rows=[]; row=''
    for word in words:
        candidate=(row+' '+word).strip()
        if row and draw.textlength(candidate,font=font(size,bold)) > width:
            rows.append(row); row=word
        else: row=candidate
    rows.append(row)
    for i,s in enumerate(rows): draw.text((xy[0],xy[1]+i*size*line),s,font=font(size,bold),fill=fill)
    return len(rows)*size*line

output=ROOT/'bestillingsfrist-og-avtalesvar-utkast.mp4'
proc=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}',
                       '-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','22',
                       '-pix_fmt','yuv420p','-movflags','+faststart',str(output)],stdin=subprocess.PIPE)
for index,scene in enumerate(scenes):
    base=Image.new('RGB',(W,H),'#081f2b'); draw=ImageDraw.Draw(base)
    draw.text((64,45),'EXPO PROFFDOK',font=font(29,True),fill='#e4f4f4')
    draw.text((64,90),'BOLIGPROSJEKTER · TO FORSKJELLIGE FRISTER',font=font(17),fill='#76c6c8')
    draw.rounded_rectangle((1455,40,1858,90),radius=22,fill='#143c49')
    draw.text((1480,54),'ARBEIDSUTKAST · SANDBOX',font=font(19,True),fill='#79ded7')
    draw.text((64,190),f'{index+1:02}',font=font(108,True),fill='#36bac3')
    draw.text((224,270),f'/ {len(scenes):02}',font=font(25),fill='#a7c2cc')
    used=wrapped(draw,scene['title'],(64,340),475,43,'#f1f7fa',True)
    wrapped(draw,scene['text'],(64,370+used),475,29,'#c2d6de')
    draw.rounded_rectangle((64,780,550,944),radius=14,fill='#123847')
    wrapped(draw,scene['note'],(86,802),440,24,'#bde8e8')
    source=Image.open(ROOT/'assets'/scene['image']).convert('RGB')
    scale=min(1240/source.width,850/source.height)
    size=(round(source.width*scale),round(source.height*scale))
    sx=620+(1240-size[0])//2; sy=145+(850-size[1])//2
    draw.rounded_rectangle((sx-6,sy-6,sx+size[0]+6,sy+size[1]+6),radius=12,fill='#365664')
    base.paste(source.resize(size,Image.Resampling.LANCZOS),(sx,sy))
    draw.text((64,1017),'Ferske skjermbilder 13.11.2026 · demo 3d65c0e · uten lyd',font=font(20),fill='#8daebc')
    tx=sx+scene['pointer'][0]*scale; ty=sy+scene['pointer'][1]*scale
    for frame in range(FPS*SECONDS):
        canvas=base.copy(); pen=ImageDraw.Draw(canvas)
        t=min(1,frame/(FPS*1.4)); eased=t*t*(3-2*t)
        x=tx+90*(1-eased); y=ty+45*(1-eased)
        shape=[(0,0),(0,34),(9,26),(17,42),(25,38),(17,23),(30,22)]
        points=[(round(x+a),round(y+b)) for a,b in shape]
        pen.polygon(points,fill='white',outline='#06202a',width=3)
        for j in range(len(scenes)):
            pen.rounded_rectangle((64+j*162,975,214+j*162,982),radius=3,fill='#29b7bf' if j<=index else '#284751')
        if frame==FPS*3: canvas.save(ROOT/f'scene-{index+1:02}.jpg',quality=92)
        proc.stdin.write(canvas.tobytes())
proc.stdin.close()
if proc.wait(): raise SystemExit('ffmpeg failed')
(ROOT/'scenes.json').write_text(json.dumps({'status':'review draft; not published in app','duration':36,'fps':FPS,
    'pointer':'same white outlined arrow; no click rings','candidate':'demo3d65c0e022ed11ec73aa569f79bfe6f362d30fae','scenes':scenes},ensure_ascii=False,indent=2)+'\n')
(ROOT/'chapters.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f'00:{i*12:02}.000 --> 00:{(i+1)*12:02}.000\n{s["title"]}' for i,s in enumerate(scenes))+'\n')
print(output)
