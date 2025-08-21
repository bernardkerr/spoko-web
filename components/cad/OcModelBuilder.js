// OpenCascade model builder runner
// Provides: getDefaultModelCode(), runBuildModel(oc, source)

export function getDefaultModelCode() {
  // 48 x 32 x 32 variant from ext/cad-viewer.md (first block)
  return `// Function to build the frame model using OpenCascade.js
function buildModel(oc) {
  const outerW = 48;
  const outerH = 32;
  const wall = 4;
  const frameZ = 4;
  const height = 32;
  const beamW = 4;

  // Helper: create a box at a point using documented overload
  // OCJS overload ref: BRepPrimAPI_MakeBox_3(point, dx, dy, dz)
  // https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox_3
  function boxAt(x, y, z, dx, dy, dz) {
    return new oc.BRepPrimAPI_MakeBox_3(new oc.gp_Pnt_3(x, y, z), dx, dy, dz).Shape();
  }

  // Build individual components and compound
  const components = [];

  // Bottom frame - four walls
  // OCJS overload ref: BRepPrimAPI_MakeBox_3(point, dx, dy, dz)
  // https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox_3
  components.push(
    boxAt(0, 0, 0, outerW, wall, frameZ),
    boxAt(0, outerH - wall, 0, outerW, wall, frameZ),
    boxAt(0, wall, 0, wall, outerH - 2*wall, frameZ),
    boxAt(outerW - wall, wall, 0, wall, outerH - 2*wall, frameZ)
  );

  // Top frame - translated up by height
  // OCJS overload ref: BRepPrimAPI_MakeBox_3(point, dx, dy, dz)
  // https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox_3
  const topZ = height;
  components.push(
    boxAt(0, 0, topZ, outerW, wall, frameZ),
    boxAt(0, outerH - wall, topZ, outerW, wall, frameZ),
    boxAt(0, wall, topZ, wall, outerH - 2*wall, frameZ),
    boxAt(outerW - wall, wall, topZ, wall, outerH - 2*wall, frameZ)
  );

  // Four vertical corner beams
  // OCJS overload ref: BRepPrimAPI_MakeBox_3(point, dx, dy, dz)
  // https://ocjs.org/reference-docs/classes/BRepPrimAPI_MakeBox_3
  components.push(
    boxAt(0, 0, frameZ, beamW, beamW, height - frameZ),
    boxAt(outerW - beamW, 0, frameZ, beamW, beamW, height - frameZ),
    boxAt(0, outerH - beamW, frameZ, beamW, beamW, height - frameZ),
    boxAt(outerW - beamW, outerH - beamW, frameZ, beamW, beamW, height - frameZ)
  );

  // Compound all components into one shape
  const builder = new oc.BRep_Builder();
  const compound = new oc.TopoDS_Compound();
  builder.MakeCompound(compound);
  for (let i = 0; i < components.length; i++) {
    builder.Add(compound, components[i]);
  }
  return compound;
}
`;
}

export function runBuildModel(oc, source) {
  if (!oc) throw new Error('OpenCascade module not loaded')
  if (typeof source !== 'string' || source.trim().length === 0) {
    throw new Error('No source code provided for model builder')
  }

  try {
    const factory = new Function('oc', `${source}\n;return (typeof buildModel === 'function') ? buildModel(oc) : null;`)
    const shape = factory(oc)
    if (!shape) throw new Error('buildModel(oc) did not return a shape')
    return shape
  } catch (err) {
    // Surface syntax/runtime errors cleanly
    throw new Error(`Model build failed: ${err.message}`)
  }
}
