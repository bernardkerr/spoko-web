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

```js cad {"name":"Robody Frame 48x48x48 STEP","model":"models/Robody_Frame_48x48x48.step", "shadingMode":"black" }
// No code needed: STEP is meshed by the OpenCascade worker and displayed; controls are hidden.
```

## Example E: More complex OC example

```js cad {"name":"MoreComplexExample", "workbench": true}
// Function to build the frame model using OpenCascade.js
function buildModel(oc) {
const width = 100;
const height = 200;
const thickness = 40;

// Step 1: Define Support Points for 2D Profile
const aPnt1 = new oc.gp_Pnt_3(-width / 2., 0, 0);
const aPnt2 = new oc.gp_Pnt_3(-width / 2., -thickness / 4., 0);
const aPnt3 = new oc.gp_Pnt_3(0, -thickness / 2., 0);
const aPnt4 = new oc.gp_Pnt_3(width / 2., -thickness / 4., 0);
const aPnt5 = new oc.gp_Pnt_3(width / 2., 0, 0);

// Step 2: Define 2D Geometry (curves)
const anArcOfCircle = new oc.GC_MakeArcOfCircle_4(aPnt2, aPnt3, aPnt4);
const aSegment1 = new oc.GC_MakeSegment_1(aPnt1, aPnt2);
const aSegment2 = new oc.GC_MakeSegment_1(aPnt4, aPnt5);

// Step 3: Create Topology from Geometry (curves to edges)
const anEdge1 = new oc.BRepBuilderAPI_MakeEdge_24(new oc.Handle_Geom_Curve_2(aSegment1.Value().get()));
const anEdge2 = new oc.BRepBuilderAPI_MakeEdge_24(new oc.Handle_Geom_Curve_2(anArcOfCircle.Value().get()));
const anEdge3 = new oc.BRepBuilderAPI_MakeEdge_24(new oc.Handle_Geom_Curve_2(aSegment2.Value().get()));

// Step 4: Create Wire from Edges
const aWire = new oc.BRepBuilderAPI_MakeWire_4(anEdge1.Edge(), anEdge2.Edge(), anEdge3.Edge());

// Step 5: Complete the 2D Profile (mirror to create closed profile)
const xAxis = oc.gp.OX();
const aTrsf = new oc.gp_Trsf_1();
aTrsf.SetMirror_2(xAxis);
const aBRepTrsf = new oc.BRepBuilderAPI_Transform_2(aWire.Wire(), aTrsf, false);
const aMirroredShape = aBRepTrsf.Shape();
const mkWire = new oc.BRepBuilderAPI_MakeWire_1();
mkWire.Add_2(aWire.Wire());
mkWire.Add_2(oc.TopoDS.Wire_1(aMirroredShape));
const myWireProfile = mkWire.Wire();

// Step 6: Create 2D Face from Wire
const myFaceProfile = new oc.BRepBuilderAPI_MakeFace_15(myWireProfile, false);

// Step 7: Define Extrusion Vector
const aPrismVec = new oc.gp_Vec_4(0, 0, height);

// Step 8: EXTRUDE 2D Face to 3D Body
let myBody = new oc.BRepPrimAPI_MakePrism_1(myFaceProfile.Face(), aPrismVec, false, true);

// return myBody.Shape();

// Body : Apply Fillets
const mkFillet = new oc.BRepFilletAPI_MakeFillet(myBody.Shape(), oc.ChFi3d_FilletShape.ChFi3d_Rational);
const anEdgeExplorer = new oc.TopExp_Explorer_2(myBody.Shape(), oc.TopAbs_ShapeEnum.TopAbs_EDGE, oc.TopAbs_ShapeEnum.TopAbs_SHAPE);
while (anEdgeExplorer.More()) {
  const anEdge = oc.TopoDS.Edge_1(anEdgeExplorer.Current());
  // Add edge to fillet algorithm
  mkFillet.Add_2(thickness / 12., anEdge);
  anEdgeExplorer.Next();
}

const myBodyShape = mkFillet.Shape();

// Body : Add the Neck
const neckLocation = new oc.gp_Pnt_3(0, 0, height);
const neckAxis = oc.gp.DZ();
const neckAx2 = new oc.gp_Ax2_3(neckLocation, neckAxis);

const myNeckRadius = 5;
const myNeckHeight = 5;

const MKCylinder = new oc.BRepPrimAPI_MakeCylinder_3(neckAx2, myNeckRadius, myNeckHeight);
const myNeck = MKCylinder.Shape();

myBody = new oc.BRepAlgoAPI_Fuse_3(myBodyShape, myNeck, new oc.Message_ProgressRange_1());
// Ensure the boolean is executed before accessing the result
myBody.Build(new oc.Message_ProgressRange_1());

return myBody.Shape();
  
}
```