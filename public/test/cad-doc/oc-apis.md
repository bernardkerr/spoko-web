# OpenCascade.js API Reference (Project Usage)

A quick reference of OCJS functions used in this project. One line for the base function, and additional lines for JS overloads/variations. Links open in new tabs.

## LLM Contribution Prompt (copy/paste)


```
Please create a table containing [FUNCTION_NAME] entries as described. If the function name does not match one exactly, find the closest match (e.g., "Cyclinder" → "BRepPrimAPI_MakeCylinder"). Follow these rules exactly:

- One table only. Do not create new tables or headings.
- Use exactly 5 columns: | Base | Description | Signature | JS Docs | C++ Docs |
- Add rows in a contiguous group:
  - First a Base row for the class/function (general description). Include both JS and C++ docs.
    - Signature on base rows: leave empty by default. Fill it only when the base has a clear JS constructor or primary callable that is not simply duplicating a listed variation. If only one variation exists and the base has a JS constructor, you may put that constructor on the base.
    - Examples of acceptable base signatures: `BRep_Builder()`, `STEPControl_Writer()`, `TopoDS_Compound()`.
  - Immediately after, add one row per JS variation/overload used or commonly needed, and FILL the Signature column.
- For variation rows, set C++ Docs to '-' (there are no per-variation C++ pages).
- JS variations in ocjs v2 are exposed as separate JS classes/members, often suffixed with _N (e.g., BRepPrimAPI_MakeBox_3) or as class methods (e.g., BRep_Tool.Triangulation). The C++ reference indicates overloads; map them to JS names used by ocjs docs.
- Consult both:
  - ocjs JS docs (reference-docs site) for the exact JS class/member names and links.
  - OpenCascade C++ reference for overloads/signatures to infer likely variations and parameter orders.

Signature rules (for the Signature column):

- Provide the JS-callable signature for each variation row only.
- Prefer constructor-style for class overloads, ommitting the `new` keyword: `<VariationName>(paramList)`.
- For method-like entries on a class, use `<Class>.<Member>(paramList)`.
- Keep it concise; parameter names/types should be recognizable (e.g., `gp_Pnt`, `gp_Ax2`).
- If multiple calls are typical, separate with `; ` in one cell.

How to form documentation URLs (verify each link opens):

- ocjs (JS) reference docs:
  - Classes: https://ocjs.org/reference-docs/classes/<ExactJSName>
    - Example: BRepPrimAPI_MakeBox → https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox
  - Overload classes/variants (suffix _N): https://ocjs.org/reference-docs/classes/<ExactJSName_N>
    - Example: BRepPrimAPI_MakeBox_3 → https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox_3
  - Enums: https://ocjs.org/reference-docs/enums/<ExactEnumName>
    - Example: TopAbs_ShapeEnum → https://ocjs.org/reference-docs/enums/TopAbs_ShapeEnum
  - Class static helpers / cast functions as anchors: https://ocjs.org/reference-docs/classes/<Class>#<Member>
    - Example: TopoDS.Face_1 → https://ocjs.org/reference-docs/classes/TopoDS#Face_1
  - Methods as anchors on class page: https://ocjs.org/reference-docs/classes/<Class>#<Method>
    - Example: BRep_Tool.Triangulation → https://ocjs.org/reference-docs/classes/BRep_Tool#Triangulation

- OpenCascade C++ reference (RefMan):
  - General pattern: https://dev.opencascade.org/doc/refman/html/<lowercased-entity>.html
  - For classes: prefix "class_" + C++ name converted to lowercase with embedded capitals expanded into segments separated by underscores and library segments preserved; multiple underscores appear between library parts (as in existing examples). This pattern is not perfectly regular across the site, so prefer search and confirm.
    - Reliable approach: search "site:dev.opencascade.org refman <ExactC++Name>" and copy the resulting URL.
    - Examples (verified above in the table):
      - BRepPrimAPI_MakeBox → class_b_rep_prim_a_p_i___make_box.html
      - TopoDS_Compound → class_topo_d_s___compound.html
      - Message_ProgressRange → class_message___progress_range.html
  - There are no distinct pages for overloads; use the base class page for C++ docs.
- Confirm signatures and ordering between JS and C++. If uncertain, annotate with "CHECK:" in the Description and prefer conservative/commonly used overloads.
- Keep descriptions short and practical (what it does, when to use). Include example parameter lists only when clarifying differences.
- Do not include code blocks or extra columns. Keep links as plain URLs.

Template to produce rows (do not include bullets):

| Base | <concise general description> |  | <JS docs URL for the base> | <C++ docs URL> |
| Base_VariationOrSuffix | <specific overload description> | <signature here> | <JS docs URL> | - |

Make sure the output is RAW markdown, so the user can copy the contents easily
```

| Base | Description | Signature | JS Docs | C++ Docs |
|---|---|---|---|---|
| BRepAlgoAPI_Cut | Boolean cut operation between two shapes | BRepAlgoAPI_Cut() | https://ocjs.org/reference-docs/classes/BRepAlgoAPI_Cut | https://dev.opencascade.org/doc/refman/html/class_b_rep_algo_a_p_i___cut.html |
| BRepAlgoAPI_Cut_1 | Constructor with two shapes | BRepAlgoAPI_Cut_1(S1: TopoDS_Shape, S2: TopoDS_Shape) | https://ocjs.org/reference-docs/classes/BRepAlgoAPI_Cut_1 | - |
| BRepAlgoAPI_Cut_2 | Constructor with shapes and parallel processing flag | BRepAlgoAPI_Cut_2(S1: TopoDS_Shape, S2: TopoDS_Shape, theRunParallel: boolean) | https://ocjs.org/reference-docs/classes/BRepAlgoAPI_Cut_2 | - |
| BRepAlgoAPI_Cut_3 | Constructor with shapes and progress range | BRepAlgoAPI_Cut_3(S1: TopoDS_Shape, S2: TopoDS_Shape, theRange: Message_ProgressRange) | https://ocjs.org/reference-docs/classes/BRepAlgoAPI_Cut_3 | - |
| BRep_Builder | Basic topology builder for creating and modifying shapes | BRep_Builder() | https://ocjs.org/reference-docs/classes/BRep_Builder | https://dev.opencascade.org/doc/refman/html/class_b_rep___builder.html |
| BRepBuilderAPI_MakeFace | Creates faces from wires, surfaces, or geometric primitives with optional boundary wires | | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace | https://dev.opencascade.org/doc/refman/html/class_b_rep_builder_a_p_i___make_face.html |
| BRepBuilderAPI_MakeFace_1 | Default constructor - not done, requires initialization | BRepBuilderAPI_MakeFace_1() | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_1 | - |
| BRepBuilderAPI_MakeFace_2 | Constructor from existing face for adding wires | BRepBuilderAPI_MakeFace_2(F: TopoDS_Face) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_2 | - |
| BRepBuilderAPI_MakeFace_3 | Constructor from plane surface | BRepBuilderAPI_MakeFace_3(P: gp_Pln) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_3 | - |
| BRepBuilderAPI_MakeFace_4 | Constructor from cylinder surface | BRepBuilderAPI_MakeFace_4(C: gp_Cylinder) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_4 | - |
| BRepBuilderAPI_MakeFace_5 | Constructor from cone surface | BRepBuilderAPI_MakeFace_5(C: gp_Cone) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_5 | - |
| BRepBuilderAPI_MakeFace_6 | Constructor from sphere surface | BRepBuilderAPI_MakeFace_6(S: gp_Sphere) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_6 | - |
| BRepBuilderAPI_MakeFace_7 | Constructor from torus surface | BRepBuilderAPI_MakeFace_7(T: gp_Torus) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_7 | - |
| BRepBuilderAPI_MakeFace_8 | Constructor from generic surface with tolerance | BRepBuilderAPI_MakeFace_8(S: Handle_Geom_Surface, TolDegen: number) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_8 | - |
| BRepBuilderAPI_MakeFace_9 | Constructor from plane with UV bounds | BRepBuilderAPI_MakeFace_9(P: gp_Pln, UMin: number, UMax: number, VMin: number, VMax: number) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_9 | - |
| BRepBuilderAPI_MakeFace_10 | Constructor from cylinder with UV bounds | BRepBuilderAPI_MakeFace_10(C: gp_Cylinder, UMin: number, UMax: number, VMin: number, VMax: number) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_10 | - |
| BRepBuilderAPI_MakeFace_11 | Constructor from cone with UV bounds | BRepBuilderAPI_MakeFace_11(C: gp_Cone, UMin: number, UMax: number, VMin: number, VMax: number) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_11 | - |
| BRepBuilderAPI_MakeFace_12 | Constructor from sphere with UV bounds | BRepBuilderAPI_MakeFace_12(S: gp_Sphere, UMin: number, UMax: number, VMin: number, VMax: number) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_12 | - |
| BRepBuilderAPI_MakeFace_13 | Constructor from torus with UV bounds | BRepBuilderAPI_MakeFace_13(T: gp_Torus, UMin: number, UMax: number, VMin: number, VMax: number) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_13 | - |
| BRepBuilderAPI_MakeFace_14 | Constructor from surface with UV bounds and tolerance | BRepBuilderAPI_MakeFace_14(S: Handle_Geom_Surface, UMin: number, UMax: number, VMin: number, VMax: number, TolDegen: number) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_14 | - |
| BRepBuilderAPI_MakeFace_15 | Constructor from wire with planar surface detection | BRepBuilderAPI_MakeFace_15(W: TopoDS_Wire, OnlyPlane: boolean) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_15 | - |
| BRepBuilderAPI_MakeFace_16 | Constructor from plane and wire boundary | BRepBuilderAPI_MakeFace_16(P: gp_Pln, W: TopoDS_Wire) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_16 | - |
| BRepBuilderAPI_MakeFace_17 | Constructor from cylinder and wire boundary | BRepBuilderAPI_MakeFace_17(C: gp_Cylinder, W: TopoDS_Wire) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_17 | - |
| BRepBuilderAPI_MakeFace_18 | Constructor from cone and wire boundary | BRepBuilderAPI_MakeFace_18(C: gp_Cone, W: TopoDS_Wire) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_18 | - |
| BRepBuilderAPI_MakeFace_19 | Constructor from sphere and wire boundary | BRepBuilderAPI_MakeFace_19(S: gp_Sphere, W: TopoDS_Wire) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_19 | - |
| BRepBuilderAPI_MakeFace_20 | Constructor from torus and wire boundary | BRepBuilderAPI_MakeFace_20(T: gp_Torus, W: TopoDS_Wire) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_20 | - |
| BRepBuilderAPI_MakeFace_21 | Constructor from surface and wire boundary | BRepBuilderAPI_MakeFace_21(S: Handle_Geom_Surface, W: TopoDS_Wire) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_21 | - |
| BRepBuilderAPI_MakeFace_22 | Constructor from face and wire for adding boundaries | BRepBuilderAPI_MakeFace_22(F: TopoDS_Face, W: TopoDS_Wire) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeFace_22 | - || BRepBuilderAPI_MakeWire | Creates wires from edges or connects edges to existing wires | BRepBuilderAPI_MakeWire() | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeWire | https://dev.opencascade.org/doc/refman/html/class_b_rep_builder_a_p_i___make_wire.html |
| BRepBuilderAPI_MakePolygon | Creates polygonal wires from points with automatic edge generation | BRepBuilderAPI_MakePolygon() | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakePolygon | https://dev.opencascade.org/doc/refman/html/class_b_rep_builder_a_p_i___make_polygon.html |
| BRepBuilderAPI_MakePolygon_1 | Default constructor for empty polygon | BRepBuilderAPI_MakePolygon_1() | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakePolygon_1 | - |
| BRepBuilderAPI_MakePolygon_3 | Constructor with three points and close flag | BRepBuilderAPI_MakePolygon_3(P1: gp_Pnt, P2: gp_Pnt, P3: gp_Pnt, Close: boolean) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakePolygon_3 | - |
| BRepBuilderAPI_MakeWire_1 | Default constructor for empty wire | BRepBuilderAPI_MakeWire_1() | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeWire_1 | - |
| BRepBuilderAPI_MakeWire_3 | Constructor with two edges | BRepBuilderAPI_MakeWire_3(E1: TopoDS_Edge, E2: TopoDS_Edge) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeWire_3 | - |
| BRepBuilderAPI_MakeWire_4 | Constructor with three edges | BRepBuilderAPI_MakeWire_4(E1: TopoDS_Edge, E2: TopoDS_Edge, E3: TopoDS_Edge) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_MakeWire_4 | - |
| BRepBuilderAPI_Transform | Applies geometric transformations to shapes | BRepBuilderAPI_Transform() | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_Transform | https://dev.opencascade.org/doc/refman/html/class_b_rep_builder_a_p_i___transform.html |
| BRepBuilderAPI_Transform_2 | Constructor with shape, transformation, and copy flag | BRepBuilderAPI_Transform_2(S: TopoDS_Shape, T: gp_Trsf, Copy: boolean) | https://ocjs.org/reference-docs/classes/BRepBuilderAPI_Transform_2 | - |
| BRepPrimAPI_MakeBox | Create a box primitive. | BRepPrimAPI_MakeBox() | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox | https://dev.opencascade.org/doc/refman/html/class_b_rep_prim_a_p_i___make_box.html |
| BRepPrimAPI_MakeBox_1 | Box by dimensions aligned to axes. | BRepPrimAPI_MakeBox_1(dx, dy, dz) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox_1 | - |
| BRepPrimAPI_MakeBox_2 | Box by two opposite corner points. | BRepPrimAPI_MakeBox_2(gp_Pnt(p1), gp_Pnt(p2)) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox_2 | - |
| BRepPrimAPI_MakeBox_3 | Box positioned at a point with sizes. | BRepPrimAPI_MakeBox_3(gp_Pnt(p), dx, dy, dz) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox_3 | - |
| BRepPrimAPI_MakeBox_4 | Box with local coordinate system. | BRepPrimAPI_MakeBox_4(gp_Ax2, dx, dy, dz) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox_4 | - |
| BRepPrimAPI_MakeCylinder | Create a cylinder primitive (full or partial). | BRepPrimAPI_MakeCylinder() | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeCylinder | https://dev.opencascade.org/doc/refman/html/class_b_rep_prim_a_p_i___make_cylinder.html |
| BRepPrimAPI_MakeCylinder_1 | Cylinder with default axis (Z), radius and height provided. | BRepPrimAPI_MakeCylinder_1(radius, height) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeCylinder_1 | - |
| BRepPrimAPI_MakeCylinder_2 | Cylinder with explicit axis (e.g., gp_Ax2), radius, height. | BRepPrimAPI_MakeCylinder_2(gp_Ax2, radius, height) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeCylinder_2 | - |
| BRepPrimAPI_MakeCylinder_3 | Partial cylinder variant with sweep angle. | BRepPrimAPI_MakeCylinder_3(gp_Ax2, radius, height, angle) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeCylinder_3 | - |
| BRepPrimAPI_MakePrism | Creates linear swept topologies (prisms) by extruding a base shape along a vector or direction | BRepPrimAPI_MakePrism() | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakePrism | https://dev.opencascade.org/doc/refman/html/class_b_rep_prim_a_p_i___make_prism.html |
| BRepPrimAPI_MakePrism_1 | Constructor with base shape and vector (S, V, Copy, Canonize) | BRepPrimAPI_MakePrism_1(shape, vector, copy?, canonize?) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakePrism_1 | - |
| BRepPrimAPI_MakePrism_2 | Constructor with base shape and direction for infinite/semi-infinite prism (S, D, Inf, Copy, Canonize) | BRepPrimAPI_MakePrism_2(shape, direction, inf, copy?, canonize?) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakePrism_2 | - |
| BRepPrimAPI_MakeSphere | Creates spherical primitives or portions of spheres | BRepPrimAPI_MakeSphere() | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeSphere | https://dev.opencascade.org/doc/refman/html/class_b_rep_prim_a_p_i___make_sphere.html |
| BRepPrimAPI_MakeSphere_1 | Constructor with radius only (full sphere) | BRepPrimAPI_MakeSphere_1(R: number) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeSphere_1 | - |
| BRepPrimAPI_MakeSphere_2 | Constructor with radius and angle (lune/digon) | BRepPrimAPI_MakeSphere_2(R: number, angle: number) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeSphere_2 | - |
| BRepPrimAPI_MakeSphere_3 | Constructor with radius and two angles (spherical segment) | BRepPrimAPI_MakeSphere_3(R: number, angle1: number, angle2: number) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeSphere_3 | - |
| BRepPrimAPI_MakeSphere_4 | Constructor with radius and three angles (portion of segment) | BRepPrimAPI_MakeSphere_4(R: number, angle1: number, angle2: number, angle3: number) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeSphere_4 | - |
| BRepPrimAPI_MakeSphere_5 | Constructor with center point and radius | BRepPrimAPI_MakeSphere_5(Center: gp_Pnt, R: number) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeSphere_5 | - |
| BRepPrimAPI_MakeWedge | Creates wedges (boxes with inclined faces) - can create pyramids using xmin=xmax=dx/2, zmin=zmax=dz/2 | BRepPrimAPI_MakeWedge() | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeWedge | https://dev.opencascade.org/doc/refman/html/class_b_rep_prim_a_p_i___make_wedge.html |
| BRepPrimAPI_MakeWedge_1 | Constructor with dimensions (dx, dy, dz, ltx) for right angular wedge | BRepPrimAPI_MakeWedge_1(dx, dy, dz, ltx) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeWedge_1 | - |
| BRepPrimAPI_MakeWedge_2 | Constructor with coordinate system and dimensions (Axes, dx, dy, dz, ltx) | BRepPrimAPI_MakeWedge_2(gp_Ax2, dx, dy, dz, ltx) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeWedge_2 | - |
| BRepPrimAPI_MakeWedge_3 | Constructor with dimensions and face parameters (dx, dy, dz, xmin, zmin, xmax, zmax) | BRepPrimAPI_MakeWedge_3(dx, dy, dz, xmin, zmin, xmax, zmax) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeWedge_3 | - |
| BRepPrimAPI_MakeWedge_4 | Constructor with coordinate system and face parameters (Axes, dx, dy, dz, xmin, zmin, xmax, zmax) | BRepPrimAPI_MakeWedge_4(gp_Ax2, dx, dy, dz, xmin, zmin, xmax, zmax) | https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeWedge_4 | - |
| BRep_Builder | Construct and fill compound shapes from parts. | BRep_Builder() | https://ocjs.org/reference-docs/classes/BRep_Builder | https://dev.opencascade.org/doc/refman/html/class_b_rep___builder.html |
| BRep_Tool | Topology utilities incl. triangulation access. | BRep_Tool() | https://ocjs.org/reference-docs/classes/BRep_Tool | https://dev.opencascade.org/doc/refman/html/class_b_rep___tool.html |
| BRep_Tool.Triangulation | Access a face triangulation for meshing/rendering. | BRep_Tool.Triangulation(face, loc, purpose) | https://ocjs.org/reference-docs/classes/BRep_Tool#Triangulation | - |
| BRepMesh_IncrementalMesh | Tessellate a shape with deflection/angle controls. | BRepMesh_IncrementalMesh() | https://ocjs.org/reference-docs/classes/BRepMesh_IncrementalMesh | https://dev.opencascade.org/doc/refman/html/class_b_rep_mesh___incremental_mesh.html |
| BRepMesh_IncrementalMesh_2 | Perform meshing with deflection/angle controls and progress. | BRepMesh_IncrementalMesh_2(shape, deflection, isRelative, angle, inParallel); | https://ocjs.org/reference-docs/classes/BRepMesh_IncrementalMesh_2 | - |
| GC_MakeArcOfCircle | Creates circular arcs from points or geometric constraints | GC_MakeArcOfCircle() | https://ocjs.org/reference-docs/classes/GC_MakeArcOfCircle | https://dev.opencascade.org/doc/refman/html/class_g_c___make_arc_of_circle.html |
| GC_MakeArcOfCircle_4 | Constructor with three points defining the arc | GC_MakeArcOfCircle_4(P1: gp_Pnt, P2: gp_Pnt, P3: gp_Pnt) | https://ocjs.org/reference-docs/classes/GC_MakeArcOfCircle_4 | - |
| GC_MakeSegment | Creates line segments between points or with geometric constraints | GC_MakeSegment() | https://ocjs.org/reference-docs/classes/GC_MakeSegment | https://dev.opencascade.org/doc/refman/html/class_g_c___make_segment.html |
| GC_MakeSegment_1 | Constructor with two points | GC_MakeSegment_1(P1: gp_Pnt, P2: gp_Pnt) | https://ocjs.org/reference-docs/classes/GC_MakeSegment_1 | - |
| Handle_Geom_Curve | Handle wrapper for 3D geometric curves | Handle_Geom_Curve() | https://ocjs.org/reference-docs/classes/Handle_Geom_Curve | https://dev.opencascade.org/doc/refman/html/class_handle___geom___curve.html |
| Handle_Geom_Curve_2 | Constructor with curve pointer | Handle_Geom_Curve_2(item: Geom_Curve) | https://ocjs.org/reference-docs/classes/Handle_Geom_Curve_2 | - |
| Message_ProgressRange | Progress handle for long operations. | Message_ProgressRange() | https://ocjs.org/reference-docs/classes/Message_ProgressRange | https://dev.opencascade.org/doc/refman/html/class_message___progress_range.html |
| Message_ProgressRange_1 | Default constructor for a progress range. | Message_ProgressRange_1() | https://ocjs.org/reference-docs/classes/Message_ProgressRange_1 | - |
| Poly_MeshPurpose | Purpose flag for triangulation retrieval. |  | https://ocjs.org/reference-docs/enums/Poly_MeshPurpose | https://dev.opencascade.org/doc/refman/html/class_poly___triangulation.html |
| TopExp_Explorer | Traverse sub-shapes (faces, edges, etc.). | TopExp_Explorer() | https://ocjs.org/reference-docs/classes/TopExp_Explorer | https://dev.opencascade.org/doc/refman/html/class_top_exp___explorer.html |
| TopExp_Explorer_2 | Explorer with filters for shape kinds to find/avoid. | TopExp_Explorer_2(shape, TopAbs_ShapeEnum.TopAbs_FACE, TopAbs_ShapeEnum.TopAbs_SHAPE) | https://ocjs.org/reference-docs/classes/TopExp_Explorer_2 | - |
| TopAbs_ShapeEnum | Enumerates topological shape kinds. |  | https://ocjs.org/reference-docs/enums/TopAbs_ShapeEnum | https://dev.opencascade.org/doc/refman/html/namespace_top_abs.html |
| TopAbs_Orientation | Orientation of a topological entity. |  | https://ocjs.org/reference-docs/enums/TopAbs_Orientation | https://dev.opencascade.org/doc/refman/html/namespace_top_abs.html |
| TopoDS_Compound | Compound topological shape containing other shapes | TopoDS_Compound() | https://ocjs.org/reference-docs/classes/TopoDS_Compound | https://dev.opencascade.org/doc/refman/html/class_topo_d_s___compound.html |
| TopoDS | Casting utilities for topological shapes. | TopoDS() | https://ocjs.org/reference-docs/classes/TopoDS | https://dev.opencascade.org/doc/refman/html/class_topo_d_s.html |
| TopoDS.Face_1 | Cast a generic shape handle to a face. | TopoDS.Face_1(shape) | https://ocjs.org/reference-docs/classes/TopoDS#Face_1 | - |
| TopoDS_Compound | Container shape type for compounds. | TopoDS_Compound() | https://ocjs.org/reference-docs/classes/TopoDS_Compound | https://dev.opencascade.org/doc/refman/html/class_topo_d_s___compound.html |
| TopLoc_Location | Location holder used by BRep APIs. | TopLoc_Location() | https://ocjs.org/reference-docs/classes/TopLoc_Location | https://dev.opencascade.org/doc/refman/html/class_top_loc___location.html |
| TopLoc_Location_1 | Default constructor. | TopLoc_Location_1() | https://ocjs.org/reference-docs/classes/TopLoc_Location_1 | - |
| gp_Pnt | 3D point used for placement of primitives. | gp_Pnt() | https://ocjs.org/reference-docs/classes/gp_Pnt | https://dev.opencascade.org/doc/refman/html/classgp___pnt.html |
| gp_Pnt_1 | Default point at origin. | gp_Pnt_1() | https://ocjs.org/reference-docs/classes/gp_Pnt_1 | - |
| gp_Pnt_2 | Construct from a gp_XYZ triple. | gp_Pnt_2(gp_XYZ) | https://ocjs.org/reference-docs/classes/gp_Pnt_2 | - |
| gp_Pnt_3 | Construct from coordinates. | gp_Pnt_3(x, y, z) | https://ocjs.org/reference-docs/classes/gp_Pnt_3 | - |
| gp_Trsf | 3D geometric transformation (translation, rotation, scaling, mirroring) | gp_Trsf() | https://ocjs.org/reference-docs/classes/gp_Trsf | https://dev.opencascade.org/doc/refman/html/classgp___trsf.html |
| gp_Trsf_1 | Default constructor for identity transformation | gp_Trsf_1() | https://ocjs.org/reference-docs/classes/gp_Trsf_1 | - |
| gp_Vec | 3D vector with X, Y, Z components for directions and displacements | gp_Vec() | https://ocjs.org/reference-docs/classes/gp_Vec | https://dev.opencascade.org/doc/refman/html/classgp___vec.html |
| gp_Vec_4 | Constructor with X, Y, Z components | gp_Vec_4(Xv: number, Yv: number, Zv: number) | https://ocjs.org/reference-docs/classes/gp_Vec_4 | - |
| STEPControl_Writer | Export a shape to STEP format. | STEPControl_Writer() | https://ocjs.org/reference-docs/classes/STEPControl_Writer | https://dev.opencascade.org/doc/refman/html/class_s_t_e_p_control___writer.html |
| STEPControl_Writer_1 | Basic export workflow. | STEPControl_Writer_1(); | https://ocjs.org/reference-docs/classes/STEPControl_Writer_1 | - |

## CAD Code Blocks: Workbench vs Viewer

You can choose between the full CAD Workbench (editor + controls) and a minimal Viewer when embedding `cadjs` code blocks.

- __Default (viewer-only)__: If you omit the `workbench` flag, the block renders a viewer without controls. A tiny wrench button overlays the top-right corner to open the Workbench at runtime.
- __Workbench enabled__: Set `workbench:true` to show all controls (Toolbar, Run/Export/Fit/Reset) and the code editor.

### Examples

- __Viewer-only (default)__

```md
```cadjs {name:"MyPart"}
// Define buildModel(oc) here
// export function buildModel(oc) { ... }
```
```

- __Full Workbench__

```md
```cadjs {name:"MyPart", workbench:true}
// Define buildModel(oc) here
// export function buildModel(oc) { ... }
```
```

### Runtime toggle behavior

- __Viewer-only → Workbench__: Click the small wrench button in the viewer overlay.
- __Workbench → Viewer-only__: Click the “Viewer Only” button in the control row.
- When entering viewer-only, conservative viewer settings are applied (no spin, frame hidden, origin hidden). When returning to Workbench, your previous viewer settings are restored.
