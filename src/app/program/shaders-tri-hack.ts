// Note: this is copied directly from https://github.com/jacomyal/sigma.js
// Modified to support cropping base image (specifically to enable sprite images)

export const VERTEX_SHADER_GLSL = `
attribute vec2 a_position;
attribute float a_size;
attribute vec4 a_color;
attribute vec4 a_texture;
attribute float a_angle;

uniform float u_ratio;
uniform float u_scale;
uniform mat3 u_matrix;
uniform float u_sqrtZoomRatio;
uniform float u_correctionRatio;

varying vec4 v_color;
varying float v_border;
varying vec4 v_texture;
varying vec2 v_diffVector;
varying float v_radius;

const float bias = 255.0 / 254.0;
const float marginRatio = 1.2; // 1.05

void main() {
  float size = a_size * u_correctionRatio * u_sqrtZoomRatio * 4.0;
  //float size = a_size * u_correctionRatio * u_ratio * 4.0;
  // workaround to keep u_scale
  v_radius = u_ratio;
  v_radius = u_scale;

  //size = a_size * u_correctionRatio * u_scale * 2.0;
  vec2 diffVector = size * vec2(cos(a_angle), sin(a_angle));
  vec2 position = a_position + diffVector * marginRatio;
  gl_Position = vec4(
    (u_matrix * vec3(position, 1)).xy,
    0,
    1
  );

  v_border = u_sqrtZoomRatio * u_sqrtZoomRatio / a_size / 50.0;
  v_diffVector = diffVector;
  v_radius = size / 2.0 / marginRatio;

  v_color = a_color;
  v_color.a *= bias;
  v_texture = a_texture;
}
`;

export const FRAGMENT_SHADER_GLSL = `
precision mediump float;

varying vec4 v_color;
varying float v_border;
varying vec4 v_texture;
varying vec2 v_diffVector;
varying float v_radius;

uniform sampler2D u_atlas;

const float radius = 0.5;
const vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main(void) {
  vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);
  vec4 color;

  if (v_texture.w > 0.0) {
    vec4 texel = texture2D(u_atlas, v_texture.xy, -1.0);
    color = vec4(mix(v_color, texel, texel.a).rgb, max(texel.a, v_color.a));
  } else {
    color = v_color;
  }

  float dist = length(v_diffVector) - v_radius;
  float t = 0.0;
  if (dist > v_border)
    t = 1.0;
  else if (dist > 0.0)
    t = dist / v_border;

  gl_FragColor = mix(color, transparent, t);
}
`;
