from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import numpy as np
import trimesh
import os
import uuid
import json

app = Flask(__name__)
CORS(app)

OUTPUT_DIR = "./generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def make_cylinder(r_bottom, r_top, height, sections=48):
    """Smooth tapered cylinder (frustum)"""
    angles  = np.linspace(0, 2 * np.pi, sections, endpoint=False)
    cos_a   = np.cos(angles)
    sin_a   = np.sin(angles)
    
    # 👇 ellipse scaling (tweak these!)
    WIDTH_SCALE = 1.2   # X direction (wider)
    DEPTH_SCALE = 0.75  # Z direction (flatter)

    # bottom ring  (y = 0)
    bot = bot = np.column_stack([
        (r_bottom * WIDTH_SCALE) * cos_a,
        np.zeros(sections),
        (r_bottom * DEPTH_SCALE) * sin_a
    ])
    # top ring     (y = height)
    top = np.column_stack([
        (r_top * WIDTH_SCALE) * cos_a,
        np.full(sections, height),
        (r_top * DEPTH_SCALE) * sin_a
    ])

    verts = np.vstack([bot, top,
                       [[0, 0,      0]],   # bottom centre  idx = 2*sections
                       [[0, height, 0]]])  # top    centre  idx = 2*sections+1
    bc = 2 * sections
    tc = 2 * sections + 1

    faces = []
    for i in range(sections):
        n = (i + 1) % sections
        # side
        faces += [[i, n, sections + n],
                  [i, sections + n, sections + i]]
        # bottom cap (normal points down)
        faces.append([bc, n, i])
        # top cap (normal points up)
        faces.append([tc, sections + i, sections + n])

    return trimesh.Trimesh(vertices=verts, faces=np.array(faces), process=True)


def place(mesh, translation):
    m = mesh.copy()
    m.apply_translation(translation)
    return m


def rotate_mesh(mesh, angle_deg, axis, point=None):
    """Rotate mesh around axis by angle_deg. point = pivot (default origin)."""
    m   = mesh.copy()
    rad = np.radians(angle_deg)
    R   = trimesh.transformations.rotation_matrix(rad, axis)
    if point is not None:
        T1 = trimesh.transformations.translation_matrix(-np.array(point))
        T2 = trimesh.transformations.translation_matrix( np.array(point))
        M  = T2 @ R @ T1
    else:
        M = R
    m.apply_transform(M)
    return m


def build_mannequin(shoulder_cm, chest_cm, waist_cm, hip_cm, arm_length_cm):
    """
    Simple tailor dummy:
      - 3 stacked torso cylinders (shoulder→chest, chest→waist, waist→hip)
      - 1 cylinder per arm, angled outward+downward
      - 1 cylinder per leg, straight down
      - No head, no neck
    """

    def r(circ): return (circ / 100.0) / (2 * np.pi)

    r_sh  = shoulder_cm/(100.0*3)
    r_ch  = r(chest_cm)
    r_wa  = r(waist_cm)
    r_hi  = r(hip_cm)
    arm_m = arm_length_cm / 100.0

    # ── Heights ─────────────────────────────────────────────────
    # Total torso height based on arm length
    TORSO_H = arm_m * 0.9   # torso slightly shorter than arm

    # Split torso into 3 segments
    T1_H = TORSO_H * 0.25   # shoulder → chest
    T2_H = TORSO_H * 0.25   # chest → waist
    T3_H = TORSO_H * 0.35   # waist → hip

    # Legs
    LEG_H = arm_m * 1.5

    LEG_R = max(0.035, r_hi * 0.35)
    ARM_R = max(0.028, r_ch * 0.25)

    meshes = []
    y = 0.0   # current floor level, building bottom-up

    # ── TORSO seg 3: waist → hip (widest at bottom) ─────────────
    t3 = place(make_cylinder(r_hi, r_wa, T3_H), [0, y, 0])
    meshes.append(t3)
    y += T3_H

    # ── TORSO seg 2: chest → waist ───────────────────────────────
    t2 = place(make_cylinder(r_wa, r_ch, T2_H), [0, y, 0])
    meshes.append(t2)
    y += T2_H

    # ── TORSO seg 1: shoulder → chest ────────────────────────────
    t1 = place(make_cylinder(r_ch, r_sh, T1_H), [0, y, 0])
    meshes.append(t1)
    shoulder_y = y + T1_H   # top of torso

    # ── LEGS ─────────────────────────────────────────────────────
    leg_x = r_hi * 0.50
    for side in [-1, 1]:
        leg = make_cylinder(LEG_R, LEG_R * 0.88, LEG_H)
        leg = place(leg, [side * leg_x, -LEG_H, 0])
        meshes.append(leg)

    # ── ARMS ─────────────────────────────────────────────────────
    # Each arm is one cylinder, built pointing up then rotated:
    #   ~25° outward from body + ~15° forward tilt (like your sketch)
    for side in [-1, 1]:
        arm_raw = make_cylinder(ARM_R, ARM_R * 0.85, arm_m)

        # pivot point = shoulder attachment (top of torso, offset outward)
        pivot = [side * r_sh, shoulder_y, 0]

        # rotate outward (Z axis for left/right lean) ~150° so arm hangs down+out
        arm_rot = rotate_mesh(arm_raw,
                              angle_deg = side * (-150),
                              axis      = [0, 0, 1],
                              point     = [0, 0, 0])

        # translate so top of arm is at shoulder
        arm_top = arm_rot.bounds[1][1]   # highest Y after rotation
        arm_rot.apply_translation([
            side * r_sh,
            shoulder_y - arm_top,
            0
        ])
        meshes.append(arm_rot)

    # ── Merge ────────────────────────────────────────────────────
    combined = trimesh.util.concatenate(meshes)
    # Sit everything on y = 0
    min_y = combined.bounds[0][1]
    combined.apply_translation([0, -min_y, 0])

    return combined


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    try:
        shoulder   = float(data.get("shoulder",   100))
        chest      = float(data.get("chest",       90))
        waist      = float(data.get("waist",       70))
        hip        = float(data.get("hip",         95))
        arm_length = float(data.get("armLength",   60))
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Invalid measurements."}), 400

    try:
        mesh = build_mannequin(shoulder, chest, waist, hip, arm_length)
    except Exception as e:
        return jsonify({"success": False,
                        "message": f"Generation failed: {str(e)}"}), 500

    mannequin_id = str(uuid.uuid4())
    file_path    = os.path.join(OUTPUT_DIR, f"{mannequin_id}.glb")
    mesh.export(file_path)

    meta_path = os.path.join(OUTPUT_DIR, f"{mannequin_id}.json")
    with open(meta_path, "w") as f:
        json.dump({"shoulder": shoulder, "chest": chest,
                   "waist": waist, "hip": hip, "armLength": arm_length}, f)

    return jsonify({"success": True, "mannequinId": mannequin_id,
                    "message": "Mannequin generated!"})


@app.route("/mannequin/<mannequin_id>", methods=["GET"])
def get_mannequin(mannequin_id):
    file_path = os.path.join(OUTPUT_DIR, f"{mannequin_id}.glb")
    if not os.path.exists(file_path):
        return jsonify({"success": False, "message": "Not found."}), 404
    return send_file(file_path, mimetype="model/gltf-binary",
                     as_attachment=False,
                     download_name=f"mannequin_{mannequin_id}.glb")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"success": True, "message": "Mannequin service running 🪡"})


if __name__ == "__main__":
    print("🪡 Mannequin microservice running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
    
    
    
    
    

