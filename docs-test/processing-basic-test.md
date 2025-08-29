# Processing.js Basic Examples

This page embeds interactive Processing.js sketches using fenced code blocks.

- Use either ```processing or ```js processing fences.
- Return a function `sketch(p)` from your code that assigns `p.setup`/`p.draw`.

## Example A: Bouncing Ball

```processing { "workbench": false, "viewerHeight": 420 }
function sketch(p){
  let x, y, vx, vy, r
  p.setup = function(){
    p.size(width, height)
    r = 18
    x = width * 0.3; y = height * 0.3
    vx = 3.2; vy = 2.1
  }
  p.draw = function(){
    p.fill(255,255,255,24); p.noStroke(); p.rect(0,0,width,height)
    x += vx; y += vy
    if (x < r || x > width - r) vx *= -1
    if (y < r || y > height - r) vy *= -1
    p.noStroke(); p.fill(16,122,255)
    p.ellipse(x, y, r*2, r*2)
  }
}
return sketch
```

## Example B: Orbiting Dots

```js processing { "workbench": false, "viewerHeight": 420 }
function sketch(p){
  p.setup = function(){ p.size(width, height) }
  p.draw = function(){
    p.fill(255,255,255,20); p.noStroke(); p.rect(0,0,width,height)
    const cx = width/2, cy = height/2
    for (let i=0;i<18;i++){
      const t = (p.frameCount*0.02) + i*0.35
      const r = 40 + (i*10)
      const x = cx + Math.cos(t) * r
      const y = cy + Math.sin(t) * r
      p.noStroke(); p.fill(0,0,0,180)
      p.ellipse(x, y, 3, 3)
    }
  }
}
return sketch
```
