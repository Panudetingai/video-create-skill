// WebGL backdrop (Three.js + GLSL): a slow rainbow aurora in the CoworkBot
// ring colors over the app's dark background. Pure function of time and a few
// uniforms, so any frame renders the same way twice.
import * as THREE from 'three';

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2  uRes;
uniform float uGlow;     // 0..1 aurora strength
uniform float uGray;     // 0..1 desaturate (S1 "grey -> yellow")
uniform float uRing;     // 0..1 rainbow ring around the center
uniform float uRingR;    // ring radius (fraction of height)
uniform vec2  uFocus;    // aurora focus (0..1 screen)
uniform float uGrid;     // 0..1 faint dot grid
varying vec2 vUv;

vec3 BG = vec3(0.051, 0.051, 0.040);

// RING_COLORS from cowork-bots.html
vec3 ring(float x){
  x = fract(x) * 7.0;
  vec3 c[8];
  c[0]=vec3(0.961,0.773,0.094); c[1]=vec3(1.0,0.604,0.180); c[2]=vec3(0.941,0.267,0.227);
  c[3]=vec3(0.969,0.376,0.624); c[4]=vec3(0.545,0.361,0.965); c[5]=vec3(0.227,0.639,0.961);
  c[6]=vec3(0.204,0.780,0.482); c[7]=vec3(0.961,0.773,0.094);
  int i = int(floor(x)); float f = smoothstep(0.0,1.0,fract(x));
  vec3 a = c[0], b = c[1];
  for (int k=0;k<7;k++){ if (k==i){ a=c[k]; b=c[k+1]; } }
  return mix(a,b,f);
}

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<3;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }

void main(){
  vec2 uv = vUv;
  vec2 p = (uv - uFocus) * vec2(uRes.x/uRes.y, 1.0);
  float t = uTime * 0.06;

  // aurora bands
  float n = fbm(p * 1.4 + vec2(t, -t*0.7));
  float band = fbm(vec2(p.x * 0.9 + n * 1.2 + t * 1.5, p.y * 2.2 - t));
  float glow = smoothstep(0.25, 0.95, band) * exp(-dot(p,p) * 0.9);
  vec3 col = BG + ring(n * 0.9 + uTime * 0.02 + p.x * 0.15) * glow * 0.55 * uGlow;

  // rainbow ring (the bots' working ring, blown up)
  float r = length(p);
  float ang = atan(p.y, p.x) / 6.28318 + 0.5;
  float ringMask = exp(-pow((r - uRingR) / 0.012, 2.0)) + 0.35 * exp(-pow((r - uRingR) / 0.06, 2.0));
  col += ring(ang + uTime * 0.08) * ringMask * uRing * 0.9;

  // dot grid
  vec2 g = fract(uv * uRes / 36.0) - 0.5;
  col += vec3(1.0) * smoothstep(0.08, 0.0, length(g)) * 0.035 * uGrid;

  // vignette + grain
  float v = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(1.3, 1.0)));
  col *= mix(0.55, 1.0, v);
  col += (hash(uv * uRes + fract(uTime) * 91.0) - 0.5) * 0.012;

  float gray = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(gray), uGray);
  gl_FragColor = vec4(col, 1.0);
}`;

export function createBackground(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(1);
  const W = 960, H = 540; // half-res: it's a soft backdrop, upscaled by CSS
  renderer.setSize(W, H, false);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTime: { value: 0 }, uRes: { value: new THREE.Vector2(W, H) },
    uGlow: { value: 0.4 }, uGray: { value: 0 }, uRing: { value: 0 }, uRingR: { value: 0.32 },
    uFocus: { value: new THREE.Vector2(0.5, 0.5) }, uGrid: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: FRAG,
    depthTest: false, depthWrite: false,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  // plain object GSAP can tween; copied into uniforms on render
  const params = { glow: 0.4, gray: 0, ring: 0, ringR: 0.32, fx: 0.5, fy: 0.5, grid: 1 };
  return {
    params,
    render(t) {
      uniforms.uTime.value = t;
      uniforms.uGlow.value = params.glow; uniforms.uGray.value = params.gray;
      uniforms.uRing.value = params.ring; uniforms.uRingR.value = params.ringR;
      uniforms.uFocus.value.set(params.fx, params.fy); uniforms.uGrid.value = params.grid;
      renderer.render(scene, camera);
    },
  };
}
