# CAD Basic Test

This page demonstrates using cadjs code blocks inside pure Markdown.

## Example A: Simple Box

```js cad {"name":"SimpleBox", "workbench": true}
export function buildModel(oc) {
  // ocjs Hello World pattern: constructor overload with dimensions
  const box = new oc.BRepPrimAPI_MakeBox_3(new oc.gp_Pnt_3(-10, -7.5, -5), 20, 15, 10)
  return box.Shape()
}
```

## Example B: Visible Boolean Cut

```js cad {"name":"BooleanCut"}
export function buildModel(oc) {
  // Box minus a larger sphere so the cut is visible from outside
  const box = new oc.BRepPrimAPI_MakeBox_3(new oc.gp_Pnt_3(-10, -10, -10), 20, 20, 20)
  const sphere = new oc.BRepPrimAPI_MakeSphere_5(new oc.gp_Pnt_3(0, 0, 0), 12)

  const cut = new oc.BRepAlgoAPI_Cut_3(
    box.Shape(),
    sphere.Shape(),
    new oc.Message_ProgressRange_1()
  )
  // Perform the boolean with its own progress range
  cut.Build(new oc.Message_ProgressRange_1())
  return cut.Shape()
}
```
## Example C: Load External STL (viewer-only)

```js cad {"name":"Test STL","model":"models/SirayaTechTestModel2021.stl"}
// No code needed: STL is loaded and displayed; workbench controls are hidden.
```

## Example D: Load External STEP (viewer-only)

```js cad {"name":"Robody Frame 48x48x48 STEP","model":"models/Robody_Frame_48x48x48.step"}
// No code needed: STEP is meshed by the OpenCascade worker and displayed; controls are hidden.
```
