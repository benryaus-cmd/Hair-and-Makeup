# Poster ink refinement

User direction: remove white edge artifacts and jagged borders; make contours feel illustrated, with thick shadow-facing strokes tapering toward the light, like a fashion/Vice City poster. Retain the present game and UI.

Implementation call: retain the existing lightweight inverted hull renderer, replacing hard face normals in the hull only with welded smooth extrusion normals. Share source positions, skinning, morphs and indices; cache and dispose the additional outline geometries. Use fixed world key-light direction for coherent line weight as the camera moves. Keep lit contours thin, shaded contours broad, and tiny trim unoutlined. Enable native canvas MSAA on phones at the existing capped render resolution. Replace the unconditional pale rim with restrained material-colored light accents and cool shadow tint.

Alternatives: a fullscreen depth/normal edge pass gives more coverage but adds render targets, scene passes and mobile cost; a uniform wider hull does not provide the requested taper. The existing hull plus variable weight and smoothing fits this game best.

Verify real Android user-agent context antialiasing, seam-normal agreement, shared deformation inputs, disposal, shader compile, portrait front/side/close views, existing shader hooks and full regressions. Physical-phone GPU performance remains a user check.
