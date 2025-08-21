// Convert an OpenCascade TopoDS_Shape to THREE.BufferGeometry
// Mirrors the working logic from ext/ocjs_init.html for v1.1.x
import * as THREE from 'three'

export function shapeToGeometry(oc, shape) {
  if (!oc || !shape) throw new Error('shapeToGeometry: missing oc or shape')

  // Mesh with reasonable defaults (linear deflection 0.1, angle 0.5 rad)
  const mesher = new oc.BRepMesh_IncrementalMesh_2(shape, 0.1, false, 0.5, false)
  // ocjs v2 requires a progress range argument for Perform
  mesher.Perform(new oc.Message_ProgressRange_1())
  if (!mesher.IsDone()) throw new Error('OpenCascade meshing failed')

  const vertices = []
  const indices = []
  const normals = []

  const faceExplorer = new oc.TopExp_Explorer_2(
    shape,
    oc.TopAbs_ShapeEnum.TopAbs_FACE,
    oc.TopAbs_ShapeEnum.TopAbs_SHAPE
  )

  let vertexOffset = 0
  while (faceExplorer.More()) {
    const face = oc.TopoDS.Face_1(faceExplorer.Current())
    const location = new oc.TopLoc_Location_1()
    // ocjs v2: Triangulation requires a third argument: Poly_MeshPurpose
    const purpose = oc.Poly_MeshPurpose?.Poly_MeshPurpose_SHADING ?? oc.Poly_MeshPurpose_SHADING ?? 0
    const triangulation = oc.BRep_Tool.Triangulation(face, location, purpose)

    if (!triangulation.IsNull()) {
      const transform = location.Transformation()
      const tri = triangulation.get()
      const nodeCount = tri.NbNodes()
      const triangleCount = tri.NbTriangles()

      // nodes
      for (let i = 1; i <= nodeCount; i++) {
        const node = tri.Node(i).Transformed(transform)
        vertices.push(node.X(), node.Y(), node.Z())
      }

      const faceOrientation = face.Orientation_1()
      const isReversed = faceOrientation === oc.TopAbs_Orientation.TopAbs_REVERSED

      // triangles
      for (let t = 1; t <= triangleCount; t++) {
        const triangle = tri.Triangle(t)
        const n1 = triangle.Value(1)
        const n2 = triangle.Value(2)
        const n3 = triangle.Value(3)

        // get vertex positions
        const v1 = tri.Node(n1).Transformed(transform)
        const v2 = tri.Node(n2).Transformed(transform)
        const v3 = tri.Node(n3).Transformed(transform)

        // face normal via cross product
        const edge1 = new THREE.Vector3(v2.X() - v1.X(), v2.Y() - v1.Y(), v2.Z() - v1.Z())
        const edge2 = new THREE.Vector3(v3.X() - v1.X(), v3.Y() - v1.Y(), v3.Z() - v1.Z())
        const normal = edge1.cross(edge2).normalize()

        if (isReversed) {
          // flip winding
          indices.push(
            vertexOffset + n1 - 1,
            vertexOffset + n3 - 1,
            vertexOffset + n2 - 1
          )
          normals.push(normal.x, normal.y, normal.z, normal.x, normal.y, normal.z, normal.x, normal.y, normal.z)
        } else {
          indices.push(
            vertexOffset + n1 - 1,
            vertexOffset + n2 - 1,
            vertexOffset + n3 - 1
          )
          normals.push(normal.x, normal.y, normal.z, normal.x, normal.y, normal.z, normal.x, normal.y, normal.z)
        }
      }

      vertexOffset += nodeCount
    }

    faceExplorer.Next()
  }

  if (vertices.length === 0) throw new Error('No vertices extracted from shape')

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  // Provide per-vertex normals (flat)
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.computeBoundingSphere()
  geometry.computeBoundingBox()

  return geometry
}
