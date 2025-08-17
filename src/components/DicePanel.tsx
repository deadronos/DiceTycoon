import React, { useEffect, useState } from 'react';
import './DicePanel.css';

type DicePanelProps = {
  faces: number[]; // current face values for each die (1-6)
  rolling: boolean;
  animationLevels?: number[]; // per-die animation intensity
};

// Use quaternion-based rotations to produce accurate orientations.
// We'll compute a unit quaternion for the rotation that places the requested face on top.
// Then convert the quaternion to a 4x4 CSS matrix (matrix3d) for the transform.

// Helper: normalize vector
function norm(v: [number, number, number]) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l] as [number, number, number];
}

// Quaternion from axis-angle
function quatFromAxisAngle(axis: [number, number, number], angleRad: number) {
  const [ax, ay, az] = norm(axis);
  const s = Math.sin(angleRad / 2);
  return [Math.cos(angleRad / 2), ax * s, ay * s, az * s] as [number, number, number, number];
}

// Multiply quaternions a * b
function quatMul(a: [number, number, number, number], b: [number, number, number, number]) {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ] as [number, number, number, number];
}

// Convert quaternion to CSS matrix3d (column-major)
function quatToMatrix3d(q: [number, number, number, number]) {
  const [w, x, y, z] = q;
  const xx = x * x, yy = y * y, zz = z * z;
  const xy = x * y, xz = x * z, yz = y * z;
  const wx = w * x, wy = w * y, wz = w * z;

  // 3x3 rotation matrix
  const m00 = 1 - 2 * (yy + zz);
  const m01 = 2 * (xy - wz);
  const m02 = 2 * (xz + wy);

  const m10 = 2 * (xy + wz);
  const m11 = 1 - 2 * (xx + zz);
  const m12 = 2 * (yz - wx);

  const m20 = 2 * (xz - wy);
  const m21 = 2 * (yz + wx);
  const m22 = 1 - 2 * (xx + yy);

  // CSS matrix3d is column-major 4x4
  return `matrix3d(
    ${m00}, ${m10}, ${m20}, 0,
    ${m01}, ${m11}, ${m21}, 0,
    ${m02}, ${m12}, ${m22}, 0,
    0, 0, 0, 1
  )`;
}

// Map face -> rotation quaternion that brings that face to +Z (top in our CSS coordinate)
// We'll assume the die's default face 1 is +Z. Then define rotations to move other faces to +Z.
function faceToMatrix3d(face: number) {
  // angles in radians
  const PI = Math.PI;
  switch (face) {
    case 1: // default, no rotation
      return quatToMatrix3d([1, 0, 0, 0]);
    case 2: // rotate -90deg around X to bring front to top
      return quatToMatrix3d(quatFromAxisAngle([1, 0, 0], -PI / 2));
    case 3: // rotate 90deg around Y to bring right to top
      return quatToMatrix3d(quatFromAxisAngle([0, 1, 0], PI / 2));
    case 4: // rotate -90deg around Y to bring left to top
      return quatToMatrix3d(quatFromAxisAngle([0, 1, 0], -PI / 2));
    case 5: // rotate 90deg around X to bring back to top
      return quatToMatrix3d(quatFromAxisAngle([1, 0, 0], PI / 2));
    case 6: // rotate 180deg around X (or Y) to bring bottom to top
      return quatToMatrix3d(quatFromAxisAngle([1, 0, 0], PI));
    default:
      return quatToMatrix3d([1, 0, 0, 0]);
  }
}

function renderPips(face: number) {
  const layouts: Record<number, number[]> = {
    1: [4],
    2: [0,8],
    3: [0,4,8],
    4: [0,2,6,8],
    5: [0,2,4,6,8],
    6: [0,2,3,5,6,8]
  };
  const positions = layouts[face] || layouts[1];
  return (
    <div className="dt-pip-grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className={`dt-pip ${positions.includes(i) ? 'dt-pip-on' : ''}`} />
      ))}
    </div>
  );
}

export default function DicePanel({ faces, rolling, animationLevels }: DicePanelProps) {
  const [localRoll, setLocalRoll] = useState(false);

  useEffect(() => {
    if (rolling) {
      setLocalRoll(true);
  const t = setTimeout(() => setLocalRoll(false), 800);
      return () => clearTimeout(t);
    }
  }, [rolling]);

  return (
    <div className="dt-dice-panel">
      {faces.map((f, i) => {
        const animLevel = (animationLevels && animationLevels[i]) || 0;
        const durationMs = Math.max(180, 800 - animLevel * 120);
        const delayMs = localRoll ? i * 80 : 0; // staggered roll by index
        const transform = faceToMatrix3d(f);
        return (
          <div key={i} className={`dt-dice-box`} data-testid={`panel-die-${i}`}>
            <div
              className="dt-die-inner"
              style={{
                transform,
                transitionDuration: `${durationMs}ms`,
                transitionDelay: `${delayMs}ms`,
                transformOrigin: 'center center',
              }}
            >
              <svg className="dt-die-svg" viewBox="0 0 100 100" width="64" height="64" aria-hidden>
                <rect x="4" y="4" width="92" height="92" rx="12" ry="12" fill="#fff" stroke="#e1e1e1" />
                {renderSvgPips(f)}
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderSvgPips(face: number) {
  // positions on a 100x100 box
  const coords: Record<number, Array<[number, number]>> = {
    1: [[50,50]],
    2: [[28,28],[72,72]],
    3: [[28,28],[50,50],[72,72]],
    4: [[28,28],[28,72],[72,28],[72,72]],
    5: [[28,28],[28,72],[50,50],[72,28],[72,72]],
    6: [[28,24],[28,50],[28,76],[72,24],[72,50],[72,76]]
  };
  const list = coords[face] || coords[1];
  return (
    <g fill="#222">
      {list.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={6} />)}
    </g>
  );
}
