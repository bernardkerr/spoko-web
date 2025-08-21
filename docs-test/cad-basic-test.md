# CAD Basic Test

This page demonstrates using cadjs code blocks inside pure Markdown.

## Example A: Cylinder (v1.1-compatible)

```cadjs
export function buildModel(oc) {
  // v1.1: cylinder overloads
  // MakeCylinder_1(radius, height)
  // MakeCylinder_2(Ax2, radius, height)
  return new oc.BRepPrimAPI_MakeCylinder_1(10, 30).Shape()
}
```

## Example B: Two Boxes Union

```cadjs
export function buildModel(oc) {
  // v1.1: two-corner constructor is MakeBox_3(Pnt, Pnt)
  const a = new oc.BRepPrimAPI_MakeBox_3(new oc.gp_Pnt_3(0,0,0), new oc.gp_Pnt_3(20,20,20)).Shape()
  const b = new oc.BRepPrimAPI_MakeBox_3(new oc.gp_Pnt_3(10,10,0), new oc.gp_Pnt_3(30,30,20)).Shape()
  const fused = new oc.BRepAlgoAPI_Fuse_3(a, b).Shape()
  return fused
}
```

