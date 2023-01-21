// Note: this is copied directly from https://github.com/jacomyal/sigma.js
// Modified to support cropping base image (specifically to enable sprite images)

export const VERTEX_SHADER_GLSL = `
attribute vec2 a_position;
attribute float a_size;
attribute vec4 a_color;
attribute vec4 a_texture;

uniform float u_ratio;
uniform float u_scale;
uniform mat3 u_matrix;

varying vec4 v_color;
varying float v_border;
varying vec4 v_texture;

const float bias = 255.0 / 254.0;

void main() {
  gl_Position = vec4(
    (u_matrix * vec3(a_position, 1)).xy,
    0,
    1
  );

  // Multiply the point size twice:
  //  - x SCALING_RATIO to correct the canvas scaling
  //  - x 2 to correct the formulae
  gl_PointSize = a_size * u_ratio * u_scale * 2.0;

  v_border = (1.0 / u_ratio) * (0.5 / a_size);

  // Extract the color:
  v_color = a_color;
  v_color.a *= bias;

  // Pass the texture coordinates:
  v_texture = a_texture;
}
`;

export const FRAGMENT_SHADER_GLSL = `
precision mediump float;

varying vec4 v_color;
varying float v_border;
varying vec4 v_texture;

uniform sampler2D u_atlas;

const float radius = 0.5;
const vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);

void main(void) {
  vec4 color;

  if (v_texture.w > 0.0) {
    vec4 texel = texture2D(u_atlas, v_texture.xy + gl_PointCoord * v_texture.zw, -1.0);
    color = vec4(mix(v_color, texel, texel.a).rgb, max(texel.a, v_color.a));
  } else {
    color = v_color;
  }

  vec2 m = gl_PointCoord - vec2(0.5, 0.5);
  float dist = length(m);

  if (dist < radius - v_border) {
    gl_FragColor = color;
  } else if (dist < radius) {
    gl_FragColor = mix(transparent, color, (radius - dist) / v_border);
  } else {
    gl_FragColor = transparent;
  }
}
`;
