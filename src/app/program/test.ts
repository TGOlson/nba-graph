import { createProgram } from "./program";
import { createFragmentShader, createVertexShader } from "./shaders";
import m4 from '../../vendor/m4';

export type Drawer = {
  draw: (params: DrawParams[]) => void
};

export const DEFAULT_DRAW_SPEC: DrawSpec = {x: 0, y: 0, height: null, width: null};

export type DrawSpec = {
  x: number,
  y: number,
  height: number | null,
  width: number | null,
};

export type DrawParams = {
  src: DrawSpec, 
  dest: DrawSpec, 
  textureInfo: TextureInfo
};

export type TextureInfo = {
  width: number,
  height: number,
  texture: WebGLTexture,
};

export const createDrawer = (gl: WebGLRenderingContext): Drawer => {
  const vertexShader = createVertexShader(gl);
  const fragmentShader = createFragmentShader(gl);
  const program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');

  // lookup uniforms
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
  if(!matrixLocation) throw new Error('Unable to get matrixLocation');
  
  const textureMatrixLocation = gl.getUniformLocation(program, 'u_textureMatrix');
  if(!textureMatrixLocation) throw new Error('Unable to get textureMatrixLocation');

  
  const textureLocation = gl.getUniformLocation(program, 'u_texture');
  if(!textureLocation) throw new Error('Unable to get textureLocation');

  // Create a buffer.
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Put a unit quad in the buffer
  const positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Create a buffer for texture coords
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Put texcoords in the buffer
  const texcoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  // Unlike images, textures do not have a width and height associated
  // with them so we'll pass in the width and height of the texture
  const drawImage = ({textureInfo, src, dest}: DrawParams) => {
    const srcWidth = src.width === null ? textureInfo.width : src.width;
    const srcHeight = src.height === null ? textureInfo.height : src.height;
    const destWidth = dest.width === null ? srcWidth : dest.width;
    const destHeight = dest.height === null ? srcHeight : dest.height;

    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);

    // Tell WebGL to use our shader program pair
    gl.useProgram(program);

    // Setup the attributes to pull data from our buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    // Note: m4 is a vendored 3rd party library, with some jsdoc-style types
    // however, it's not completely typed, and kind of a pair to improve on the partial typing
    // so just ignore for this section of calls

    // this matrix will convert from pixels to clip space
    let matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // this matrix will translate our quad to dstX, dstY
    matrix = m4.translate(matrix, dest.x, dest.y, 0);

    // this matrix will scale our 1 unit quad
    // from 1 unit to texWidth, texHeight units
    matrix = m4.scale(matrix, destWidth, destHeight, 1);
    
    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    // if (textureInfo.width === 125) debugger;

    // Because texture coordinates go from 0 to 1
    // and because our texture coordinates are already a unit quad
    // we can select an area of the texture by scaling the unit quad
    // down
    let texMatrix = m4.translation(src.x / textureInfo.width, src.y / textureInfo.height, 0);
    texMatrix = m4.scale(texMatrix, srcWidth / textureInfo.width, srcHeight / textureInfo.height, 1);
    
    // Set the texture matrix.
    gl.uniformMatrix4fv(textureMatrixLocation, false, texMatrix);
    /* eslint-enable */

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(textureLocation, 0);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  return {
    draw: (params: DrawParams[]) => {
      // useful?
      // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    
      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
    
      params.forEach(drawImage);
    }
  };
};

// creates a texture info { width: w, height: h, texture: tex }
// The texture will start with 1x1 pixels and be updated
// when the image has loaded
export const loadImageAndCreateTextureInfo = (gl: WebGLRenderingContext, url: string): TextureInfo => {
  const tex = gl.createTexture();
  if (!tex) throw new Error('Unable to create texture');

  gl.bindTexture(gl.TEXTURE_2D, tex);

  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

  // let's assume all images are not a power of 2
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const textureInfo = {
    width: 1,   // we don't know the size until it loads
    height: 1,
    texture: tex,
  };
  
  const image: HTMLImageElement = new Image();
  
  image.onload = () => {
    textureInfo.width = image.width;
    textureInfo.height = image.height;

    console.log('loaded');

    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };

  image.src = url;

  return textureInfo;
};
