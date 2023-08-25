// Note: this is copied directly from https://github.com/jacomyal/sigma.js
// Modified to support cropping base image (specifically to enable sprite images)

export const VERTEX_SHADER_GLSL = `
attribute vec2 a_position;
attribute float a_size;
attribute vec4 a_color;
attribute vec4 a_texture;
attribute float a_angle;
attribute vec4 a_borderColor;

uniform float u_ratio;
uniform float u_scale;
uniform mat3 u_matrix;
uniform float u_sqrtZoomRatio;
uniform float u_correctionRatio;

varying vec4 v_color;
varying vec4 v_borderColor;
varying float v_softborder;
varying float v_border;
varying vec4 v_texture;
varying vec2 v_diffVector;
varying float v_radius;

const float bias = 255.0 / 254.0;
const float marginRatio = 1.05;
const float border_factor = 1.0;
const float border_width_factor = 1.105;
const float border_soft_factor = 0.0005;

void main() {
  float size = a_size * u_correctionRatio * u_sqrtZoomRatio * 4.0;
  // float size = a_size * u_correctionRatio * (1. / u_sqrtZoomRatio*u_sqrtZoomRatio ) * 4.0 * border_factor;
  // workaround to keep u_scale and u_ratio
  gl_PointSize = u_ratio * u_scale * 2.0;

  vec2 diffVector = size * vec2(cos(a_angle), sin(a_angle));
  vec2 position = a_position + diffVector * marginRatio;
  gl_Position = vec4(
    (u_matrix * vec3(position, 1)).xy,
    0,
    1
  );

  v_diffVector = diffVector;
  v_radius = size / 2.0 / marginRatio;
  v_border = v_radius * border_width_factor;
  v_softborder = border_soft_factor / u_ratio;
  v_color = a_color;
  v_color.a *= bias;
  v_texture = a_texture;
  v_borderColor = a_borderColor;
  v_borderColor.a *= bias;
}
`;

export const FRAGMENT_SHADER_GLSL = `
precision mediump float;

varying vec4 v_color;
varying float v_border;
varying vec4 v_borderColor;
varying float v_softborder;
varying vec4 v_texture;
varying vec2 v_diffVector;
varying float v_radius;
varying float v_angle;
varying vec2 v_position;



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

  if (v_texture.z > 0.0) {
    vec4 texel = texture2D(u_atlas, v_texture.xy, -1.0);
    color = vec4(mix(v_color, texel, texel.a).rgb, max(texel.a, v_color.a));
  } else {
    color = v_color;
  }

  float dist = length(v_diffVector) - v_radius;
  vec4 border_color = v_borderColor;

  if (dist > v_softborder)
    // outside border
    gl_FragColor = transparent;
  else if (dist > 0.0)
    // outside border antialias
    gl_FragColor = mix(border_color, transparent, dist / v_softborder);
  else if (dist > v_radius - v_border + v_softborder)
    // inner border
    gl_FragColor = mix(color, border_color, border_color.a);
  else if (dist > v_radius - v_border)
    // inner border antialias
    gl_FragColor = mix(color, border_color, (dist - v_radius + v_border) / v_softborder);
  else
    gl_FragColor = color;
}
`;
