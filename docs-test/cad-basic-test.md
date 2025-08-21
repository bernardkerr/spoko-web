# CAD Basic Test

This page demonstrates using cadjs code blocks inside pure Markdown.

## Example A: Simple Box

```js cad {"name":"SimpleBox","units":"mm"}
export function buildModel(oc) {
  // ocjs Hello World pattern: constructor overload with dimensions
  const box = new oc.BRepPrimAPI_MakeBox_2(20, 15, 10)
  return box.Shape()
}
```

## Example B: Visible Boolean Cut

```js cad {"name":"BooleanCut","units":"mm"}
export function buildModel(oc) {
  // Box minus a larger sphere so the cut is visible from outside
  const box = new oc.BRepPrimAPI_MakeBox_2(20, 20, 20)
  const sphere = new oc.BRepPrimAPI_MakeSphere_5(new oc.gp_Pnt_3(10, 10, 10), 12)

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
