"use client";

import { useEffect, useRef } from "react";

/**
 * A honeycomb of small blue cells drawn on the GPU behind a section.
 * The pointer presses a soft dip into the surface, a slow swell keeps it alive when idle,
 * and a tap sends out a ripple. With "reduce motion" on, it draws one still frame.
 * Without WebGL it draws nothing, so the section's own background shows instead.
 */

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;      // canvas size in device pixels
uniform vec2 uMouse;    // pointer in device pixels, origin top-left
uniform float uPress;   // 0..1 how deep the pointer dip is
uniform float uTime;    // seconds
uniform float uCell;    // cell size in device pixels
uniform float uRadius;  // dip radius in device pixels
uniform vec3 uRipple;   // x, y (device px), age in seconds (<0 = none)
uniform vec3 uBase;     // base colour
uniform vec3 uGlow;     // rim colour

const vec2 R = vec2(1.0, 1.7320508);

float height(vec2 c) {
  vec2 d = c - uMouse;
  float dip = -uPress * exp(-dot(d, d) / (uRadius * uRadius));
  float swell = 0.10 * sin(c.x * 0.0035 + uTime * 0.45) * sin(c.y * 0.0042 - uTime * 0.35);
  float ripple = 0.0;
  if (uRipple.z >= 0.0) {
    float r = length(c - uRipple.xy);
    float front = uRipple.z * uRadius * 3.2;
    float w = uRadius * 0.45;
    ripple = -0.75 * exp(-pow((r - front) / w, 2.0)) * exp(-uRipple.z * 1.6);
  }
  return dip + swell + ripple;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  // Pinch the grid towards the dip so the cells inside it look further away.
  vec2 dm = frag - uMouse;
  float pull = uPress * exp(-dot(dm, dm) / (uRadius * uRadius * 1.6));
  vec2 uv = (frag + dm * pull * 0.22) / uCell;

  // Nearest hex centre.
  vec2 h = R * 0.5;
  vec2 a = mod(uv, R) - h;
  vec2 b = mod(uv - h, R) - h;
  vec2 gv = dot(a, a) < dot(b, b) ? a : b;
  vec2 centre = (uv - gv) * uCell;

  // Surface height and slope at this cell.
  float e = uCell * 0.9;
  float hc = height(centre);
  vec2 grad = vec2(height(centre + vec2(e, 0.0)) - height(centre - vec2(e, 0.0)),
                   height(centre + vec2(0.0, e)) - height(centre - vec2(0.0, e))) / (2.0 * e) * uRadius;

  // Hex edge distance: 0 at the centre, 0.5 at the edge.
  vec2 q = abs(gv);
  float edge = max(dot(q, normalize(R)), q.x);

  // Sunken cells shrink a little, so the gaps open up inside the dip.
  float inset = 0.47 + 0.07 * clamp(hc, -1.0, 0.2);
  float cell = 1.0 - smoothstep(inset - 0.025, inset, edge);

  vec2 light = normalize(vec2(-0.6, -0.8));
  float facing = dot(-grad, light);               // slope towards the light
  float bevel = smoothstep(inset - 0.12, inset - 0.01, edge) * dot(normalize(gv + 1e-5), light);

  vec3 col = uBase;
  col *= 1.0 + 0.6 * hc;                          // deeper = darker
  col += 0.30 * facing * vec3(0.55, 0.75, 1.0);                            // lit slopes
  col += uGlow * 0.30 * clamp(length(grad), 0.0, 1.5);  // blue glow on the rim of the dip
  col += 0.035 * bevel;                            // bevelled cell edge
  vec3 gap = uBase * 0.55 + uGlow * 0.06 * (0.6 - hc);
  col = mix(gap, col, cell);

  // Soft vignette for depth.
  vec2 v = frag / uRes - 0.5;
  col *= 1.0 - 0.35 * dot(v, v);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function HexField({
  className = "",
  cell = 22,
  base = "#003366",
  glow = "#0066CC",
}: {
  className?: string;
  /** Cell size in CSS pixels. */
  cell?: number;
  base?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes"), uMouse = u("uMouse"), uPress = u("uPress"), uTime = u("uTime");
    const uCell = u("uCell"), uRadius = u("uRadius"), uRipple = u("uRipple"), uBase = u("uBase"), uGlow = u("uGlow");
    gl.uniform3fv(uBase, hexToRgb(base));
    gl.uniform3fv(uGlow, hexToRgb(glow));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;
    let w = 0, h = 0;
    const target = { x: -9999, y: -9999, press: 0 };
    const cur = { x: -9999, y: -9999, press: 0 };
    let ripple = { x: 0, y: 0, start: -1 };
    let visible = true;
    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * dpr));
      h = Math.max(1, Math.round(r.height * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uCell, cell * dpr);
      gl.uniform1f(uRadius, Math.min(170, Math.max(110, r.width * 0.11)) * dpr);
      if (reduce) draw(0);
    };

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      cur.x += (target.x - cur.x) * 0.16;
      cur.y += (target.y - cur.y) * 0.16;
      cur.press += (target.press - cur.press) * 0.07;
      gl.uniform2f(uMouse, cur.x, cur.y);
      gl.uniform1f(uPress, cur.press);
      gl.uniform1f(uTime, reduce ? 0 : t);
      const age = ripple.start < 0 ? -1 : (now - ripple.start) / 1000;
      if (age > 3) ripple.start = -1;
      gl.uniform3f(uRipple, ripple.x, ripple.y, age);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      draw(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const p = toLocal(e);
      if (cur.press < 0.02) { cur.x = p.x; cur.y = p.y; }
      target.x = p.x;
      target.y = p.y;
      target.press = p.inside ? 1 : 0;
    };
    const onLeave = () => { target.press = 0; };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      if (!p.inside) return;
      ripple = { x: p.x, y: p.y, start: performance.now() };
      if (e.pointerType === "touch") {
        cur.x = target.x = p.x;
        cur.y = target.y = p.y;
        target.press = 0.9;
        window.setTimeout(() => { target.press = 0; }, 450);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let io: IntersectionObserver | undefined;
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      });
      io.observe(canvas);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [cell, base, glow]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
