# Processing.js API Cheatsheet

| Category | Name | Signature | Notes |
|---|---|---|---|
| Structure | setup | `p.setup(): void` | Called once on start |
| Structure | draw | `p.draw(): void` | Called every frame (default ~60 FPS) |
| Canvas | size | `p.size(w: number, h: number): void` | Sets canvas size (in JS mode) |
| Color | background | `p.background(gray | r,g,b | r,g,b,a): void` | Clears with color |
| Style | stroke | `p.stroke(gray | r,g,b | r,g,b,a): void` | Set stroke color |
| Style | noStroke | `p.noStroke(): void` | Disable stroke |
| Style | fill | `p.fill(gray | r,g,b | r,g,b,a): void` | Set fill color |
| Shapes | rect | `p.rect(x,y,w,h): void` | Draw rectangle |
| Shapes | ellipse | `p.ellipse(cx,cy,w,h): void` | Draw ellipse |
| Shapes | line | `p.line(x1,y1,x2,y2): void` | Draw line |
| Math | frameCount | `p.frameCount: number` | Number of frames since start |
| Transform | translate | `p.translate(x,y): void` | Move origin |
| Transform | rotate | `p.rotate(rad): void` | Rotate (radians) |
| Timing | millis | `p.millis(): number` | Milliseconds since start |

Tips:
- Return a function `sketch(p){ p.setup=...; p.draw=... }` from your code block.
- The workbench provides `width` and `height` variables matching the viewer.
- Use light alpha fills (e.g., `p.fill(0,0,0,16)`) to create motion trails.
