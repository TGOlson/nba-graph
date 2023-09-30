// Note: this is mainly copied from https://github.com/jacomyal/sigma.js
// Modified to use a large sprite file, and to use triangles rendering for better resolution
// => https://github.com/jacomyal/sigma.js/pull/1206/files#diff-dcd59c129b10e8a7369ea98a6d576d8a40fbf150e06ca94e5177ee4e531a4987

export const VERTEX_SHADER_GLSL = `
attribute vec2 a_position;
attribute float a_size;
attribute vec4 a_color;
attribute vec4 a_texture;
attribute float a_angle;
attribute vec4 a_borderColor;
attribute float a_mutedImage;

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
varying float v_mutedImage;

const float bias = 255.0 / 254.0;
const float marginRatio = 1.05;

const float border_factor = 1.0;

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
  v_softborder = 0.0001 / u_ratio;
  v_radius = size / 2.0 / marginRatio;

  // Previous value, but this seems to clip some pictures on the top
  v_border = v_radius * 1.105;

  v_color = a_color;
  v_color.a *= bias;
  v_texture = a_texture;
  v_borderColor = a_borderColor;
  v_mutedImage = a_mutedImage;
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
varying float v_mutedImage;

uniform sampler2D u_atlas;

const float radius = 0.5;
const vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);

void main(void) {
  vec4 color;

  if (v_texture.z > 0.0) {
    // texture
    vec4 texel = texture2D(u_atlas, v_texture.xy, -1.0);
    
    if (v_mutedImage > 0.5) {
      // greyscale w/ alpha
      
      float gray = 0.21 * texel.r + 0.71 * texel.g + 0.07 * texel.b;
      float opacity = 0.5;
      vec4 grayTexel = vec4(texel.rgb * 0.0 + gray, opacity);
      color = vec4(mix(v_color, grayTexel, grayTexel.a).rgb, max(texel.a, v_color.a));
    } else {
      // normal
      color = vec4(mix(v_color, texel, texel.a).rgb, max(texel.a, v_color.a));
    }
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
    // gl_FragColor = mix(color, border_color, border_color.a);
    gl_FragColor = border_color;
  else if (dist > v_radius - v_border)
    // inner border antialias
    gl_FragColor = mix(color, border_color, (dist - v_radius + v_border) / v_softborder);
  else
    gl_FragColor = color;
}
`;
