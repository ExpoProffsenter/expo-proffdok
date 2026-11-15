#!/usr/bin/env python3
"""Render an editable, silent tutorial from original Preview screenshots.

Edit timeline.json (text, duration, target rectangles); replace assets individually.
Requires Python 3, Pillow, FFmpeg and FFprobe. No network or app access.
"""
import argparse, json, math, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
META = json.loads((ROOT/'timeline.json').read_text())
W, H = 1920, 1080
NAVY = (11, 30, 41)
INK = (239, 248, 249)
MUTED = (160, 188, 197)
TEAL = (56, 214, 208)

def font(size, bold=False):
    return ImageFont.truetype(str(ROOT/'fonts'/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),size)

def wrap(draw, text, fnt, width):
    lines=[]
    for paragraph in text.split('\n'):
        line=''
        for word in paragraph.split():
            test=(line+' '+word).strip()
            if line and draw.textlength(test,font=fnt)>width:
                lines.append(line); line=word
            else: line=test
        lines.append(line)
    return lines

def smooth(x):
    x=max(0,min(1,x)); return x*x*(3-2*x)

def background():
    im=Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
    for y in range(H):
        p=y/H; d.line((0,y,W,y),fill=(int(11+7*p),int(30+14*p),int(41+16*p)))
    d.ellipse((-360,-350,750,780),outline=(25,58,68),width=2)
    d.ellipse((-250,-250,640,650),outline=(22,53,64),width=2)
    d.text((60,37),'EXPO PROFFDOK',font=font(27,True),fill=INK)
    d.text((337,43),'KORT VEILEDNING',font=font(17),fill=TEAL)
    d.rounded_rectangle((1710,30,1860,70),radius=20,fill=(27,66,76))
    d.text((1737,40),META.get('badge','MIN SIDE'),font=font(17,True),fill=TEAL)
    d.line((60,89,1860,89),fill=(42,71,83),width=1)
    d.text((60,1012),META.get('module_label','MIN SIDE'),font=font(17,True),fill=MUTED)
    d.text((60,1037),'Faktiske Preview-bilder · Demodata · Uten lyd',font=font(15),fill=MUTED)
    return im

def build_static(scene, index, total):
    im=background(); d=ImageDraw.Draw(im)
    d.text((60,143),f'{index+1:02d}',font=font(112,True),fill=TEAL)
    d.text((224,228),f'/ {total:02d}',font=font(24),fill=MUTED)
    y=301
    for line in wrap(d,scene['title'],font(43,True),440):
        d.text((60,y),line,font=font(43,True),fill=INK); y+=55
    y+=28
    for line in wrap(d,scene['text'],font(27),430):
        d.text((60,y),line,font=font(27),fill=(207,225,231)); y+=40
    if scene.get('hint'):
        y=max(685,y+38)
        d.rounded_rectangle((60,y,491,y+108),radius=15,fill=(24,61,71),outline=(36,94,102),width=1)
        yy=y+18
        for line in wrap(d,scene['hint'],font(20),385):
            d.text((81,yy),line,font=font(20),fill=TEAL); yy+=29
    step=min(42,430/total)
    for j in range(total):
        x=60+j*step
        d.rounded_rectangle((x,945,x+step*29/42,951),radius=3,fill=TEAL if j<=index else (53,78,87))
    return im

def placement(image, local, duration):
    # Entire original screenshot stays visible. No crop, no screenshot reflow.
    scale=0.936*(0.991+0.009*smooth(local/duration))
    sw,sh=round(image.width*scale),round(image.height*scale)
    x=round(1230-sw/2); y=round(574-sh/2)
    return x,y,sw,sh

_resize_cache = {}
_resize_source = None

def screen(im, original, local, duration):
    global _resize_source
    if _resize_source is not original:
        _resize_cache.clear()
        _resize_source = original
    x,y,sw,sh=placement(original,local,duration)
    d=ImageDraw.Draw(im)
    d.rounded_rectangle((x-7,y-39,x+sw+7,y+sh+7),radius=16,fill=(33,58,69),outline=(59,91,102),width=1)
    for j in range(3):d.ellipse((x+9+j*17,y-25,x+16+j*17,y-18),fill=(92,130,141) if j else TEAL)
    d.text((x+88,y-28),'Expo ProffDok / Preview',font=font(14),fill=(184,209,217))
    if (sw,sh) not in _resize_cache:
        _resize_cache[(sw,sh)] = original.resize((sw,sh),Image.Resampling.LANCZOS)
    im.paste(_resize_cache[(sw,sh)],(x,y))
    return x,y,sw,sh

def mapped(rect, image, p):
    x,y,sw,sh=p
    # CUA screenshots are uniformly scaled from the viewport 1363 x 936.
    return (x+rect['x']*sw/1363,y+rect['y']*sh/936,rect['width']*sw/1363,rect['height']*sh/936)

def focus(im, rect, opacity):
    x,y,w,h=rect
    layer=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(layer)
    d.rounded_rectangle((x-6,y-6,x+w+6,y+h+6),radius=9,outline=(*TEAL,int(220*opacity)),width=3)
    im.paste(layer,(0,0),layer)

def cursor(im,x,y,click_age=None):
    layer=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(layer)
    if click_age is not None and 0<=click_age<0.8:
        u=click_age/0.8; r=12+54*u
        d.ellipse((x-r,y-r,x+r,y+r),outline=(*TEAL,round(235*(1-u))),width=4)
        d.ellipse((x-10,y-10,x+10,y+10),fill=(*TEAL,round(125*(1-u))))
    shape=[(0,0),(3,37),(12,27),(22,46),(30,42),(20,24),(34,23)]
    d.polygon([(x+a+3,y+b+4)for a,b in shape],fill=(0,0,0,100))
    pts=[(x+a,y+b) for a,b in shape]
    d.polygon(pts,fill=(247,255,255,255)); d.line(pts+[pts[0]],fill=(1,49,61,255),width=2)
    im.paste(layer,(0,0),layer)

def render_frame(scene, index, total, local, elapsed, duration, originals, bases):
    im=bases[index].copy(); original=originals[scene['image']]
    p=screen(im,original,local,scene['duration'])
    rects=scene.get('highlights',[])
    for rect in rects:
        focus(im,mapped(rect,original,p),0.8*smooth(local/0.6))
    target=scene.get('target')
    if target:
        rect=mapped(target,original,p); tx,ty=rect[0]+rect[2]*0.53,rect[1]+rect[3]*0.55
        click=scene.get('click',scene['duration']-0.32)
        start=max(0.6,click-2.1)
        u=smooth((local-start)/1.8)
        sx,sy=p[0]+p[2]*0.8,p[1]+p[3]*0.75
        px=sx+(tx-sx)*u; py=sy+(ty-sy)*u
        if local>start: focus(im,rect,min(1,(local-start)/0.7))
        cursor(im,px,py,local-click if scene.get('action') == 'click' else None)
    ImageDraw.Draw(im).rectangle((0,H-5,round(W*min(1,(elapsed+local)/duration)),H),fill=TEAL)
    return im

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--output',default='ProffDok_prøvevideo.mp4'); ap.add_argument('--frames-only',action='store_true'); ap.add_argument('--fps',type=int,default=24); args=ap.parse_args()
    data=json.loads((ROOT/'timeline.json').read_text()); scenes=data['scenes']; duration=sum(s['duration'] for s in scenes)
    originals={s['image']:Image.open(ROOT/s['image']).convert('RGB') for s in scenes}
    bases=[build_static(s,i,len(scenes)) for i,s in enumerate(scenes)]
    qa=ROOT/'review'; qa.mkdir(exist_ok=True)
    elapsed=0
    for i,s in enumerate(scenes):
        render_frame(s,i,len(scenes),min(s['duration']/2,4),elapsed,duration,originals,bases).save(qa/f'{i+1:02d}.jpg',quality=94)
        elapsed+=s['duration']
    if args.frames_only:return
    out=Path(args.output).resolve()
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(args.fps),'-i','-','-an','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',str(out)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    elapsed=0; previous=None
    try:
        for i,s in enumerate(scenes):
            for frame in range(round(s['duration']*args.fps)):
                im=render_frame(s,i,len(scenes),frame/args.fps,elapsed,duration,originals,bases)
                if previous is not None and frame<round(0.22*args.fps):
                    im=Image.blend(previous,im,smooth(frame/(0.22*args.fps)))
                proc.stdin.write(im.tobytes())
            previous=im.copy()
            elapsed+=s['duration'];print(f'Scene {i+1}/{len(scenes)}: {elapsed:.0f}s',flush=True)
        proc.stdin.close();code=proc.wait()
        if code:raise SystemExit(code)
    except BaseException:
        proc.kill();raise
    print(out,flush=True)

if __name__=='__main__':main()
