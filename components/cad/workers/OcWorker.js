// Module web worker that owns the OpenCascade runtime and heavy work
// Protocol:
//  - posts { type: 'ready' } after OC init
//  - receives { type: 'build', source: string }
//    -> executes user model code, meshes, returns typed arrays
//  - posts { type: 'buildResult', positions, normals, indices } with transferables
//  - posts { type: 'error', message }

import { loadOc } from '@/components/cad/OcLoader'
import { runBuildModel } from '@/components/cad/OcModelBuilder'

let oc = null

function cross(ax, ay, az, bx, by, bz) {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]
}
function normalize(x, y, z) {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}

function shapeToBuffers(oc, shape) {
  const mesher = new oc.BRepMesh_IncrementalMesh_2(shape, 0.1, false, 0.5, false)
  mesher.Perform(new oc.Message_ProgressRange_1())
  if (!mesher.IsDone()) throw new Error('OpenCascade meshing failed in worker')

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
    const purpose = oc.Poly_MeshPurpose?.Poly_MeshPurpose_SHADING ?? oc.Poly_MeshPurpose_SHADING ?? 0
    const triangulation = oc.BRep_Tool.Triangulation(face, location, purpose)

    if (!triangulation.IsNull()) {
      const transform = location.Transformation()
      const tri = triangulation.get()
      const nodeCount = tri.NbNodes()
      const triangleCount = tri.NbTriangles()

      for (let i = 1; i <= nodeCount; i++) {
        const node = tri.Node(i).Transformed(transform)
        vertices.push(node.X(), node.Y(), node.Z())
      }

      const faceOrientation = face.Orientation_1()
      const isReversed = faceOrientation === oc.TopAbs_Orientation.TopAbs_REVERSED

      for (let t = 1; t <= triangleCount; t++) {
        const triangle = tri.Triangle(t)
        const n1 = triangle.Value(1)
        const n2 = triangle.Value(2)
        const n3 = triangle.Value(3)

        const v1 = tri.Node(n1).Transformed(transform)
        const v2 = tri.Node(n2).Transformed(transform)
        const v3 = tri.Node(n3).Transformed(transform)

        const e1x = v2.X() - v1.X(), e1y = v2.Y() - v1.Y(), e1z = v2.Z() - v1.Z()
        const e2x = v3.X() - v1.X(), e2y = v3.Y() - v1.Y(), e2z = v3.Z() - v1.Z()
        let [nx, ny, nz] = cross(e1x, e1y, e1z, e2x, e2y, e2z)
        ;[nx, ny, nz] = normalize(nx, ny, nz)

        if (isReversed) {
          indices.push(
            vertexOffset + n1 - 1,
            vertexOffset + n3 - 1,
            vertexOffset + n2 - 1
          )
        } else {
          indices.push(
            vertexOffset + n1 - 1,
            vertexOffset + n2 - 1,
            vertexOffset + n3 - 1
          )
        }
        // flat normals: duplicate per vertex of triangle
        normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz)
      }

      vertexOffset += nodeCount
    }

    faceExplorer.Next()
  }

  if (vertices.length === 0) throw new Error('No vertices extracted from shape')

  const positions = new Float32Array(vertices)
  const nrm = new Float32Array(normals)
  const idx = new Uint32Array(indices)
  return { positions, normals: nrm, indices: idx }
}

async function ensureOc() {
  if (oc) return oc
  oc = await loadOc()
  return oc
}

self.addEventListener('message', async (ev) => {
  const msg = ev.data || {}
  try {
    if (msg.type === 'init') {
      await ensureOc()
      self.postMessage({ type: 'ready', id: msg.id })
      return
    }
    if (msg.type === 'build') {
      const oc = await ensureOc()
      const shape = runBuildModel(oc, msg.source || '')
      const { positions, normals, indices } = shapeToBuffers(oc, shape)
      self.postMessage(
        { type: 'buildResult', id: msg.id, positions, normals, indices },
        [positions.buffer, normals.buffer, indices.buffer]
      )
      return
    }
  } catch (e) {
    const message = e?.message || String(e)
    self.postMessage({ type: 'error', id: msg.id, message })
  }
})

// Auto-init on worker load
;(async () => {
  try {
    await ensureOc()
    self.postMessage({ type: 'ready' })
  } catch (e) {
    self.postMessage({ type: 'error', message: e?.message || String(e) })
  }
})()
