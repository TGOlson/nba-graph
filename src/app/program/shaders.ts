export const VERTEX_SHADER_GLSL = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;

  uniform mat4 u_matrix;

  varying vec2 v_texcoord;
  uniform mat4 u_textureMatrix;

  void main() {
    gl_Position = u_matrix * a_position;
    v_texcoord = (u_textureMatrix * vec4(a_texcoord, 0, 1)).xy;
  }
`;

export const FRAGMENT_SHADER_GLSL = `
  precision mediump float;
  
  varying vec2 v_texcoord;
  
  uniform sampler2D u_texture;
  
  void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
  }
`;

const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type);
  
  if(!shader) throw new Error('Unable to create shader');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS) as GLboolean;
  
  if (!success) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    
    throw new Error('Unable to create shader');
  }
  
  return shader;
};

export const createVertexShader = 
  (gl: WebGLRenderingContext): WebGLShader => createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_GLSL);

export const createFragmentShader = 
  (gl: WebGLRenderingContext): WebGLShader => createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_GLSL);
