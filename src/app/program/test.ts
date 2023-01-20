import { createProgram } from "./program";
import { createFragmentShader, createVertexShader } from "./shaders";

type m4 = {
  orthographic: () => void
};

declare const m4: any; // TODO

export type Drawer = {
  draw: (params: DrawParams[]) => void
};

export type DrawParams = {
  x: number,
  y: number,
  dx: number,
  dy: number,
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
  if(!matrixLocation) throw new Error('Unable to get matrix location');
  
  const textureLocation = gl.getUniformLocation(program, 'u_texture');
  if(!textureLocation) throw new Error('Unable to get matrix location');

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
  const drawImage = (tex: WebGLTexture, texWidth: number, texHeight: number, dstX: number, dstY: number) => {
    console.log('drawing image!');

    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Tell WebGL to use our shader program pair
    gl.useProgram(program);

    // Setup the attributes to pull data from our buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // this matrix will convert from pixels to clip space
    let matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // this matrix will translate our quad to dstX, dstY
    matrix = m4.translate(matrix, dstX, dstY, 0);

    // this matrix will scale our 1 unit quad
    // from 1 unit to texWidth, texHeight units
    matrix = m4.scale(matrix, texWidth, texHeight, 1);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

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
    
      params.forEach(({textureInfo, x, y}) => {
        drawImage(textureInfo.texture, textureInfo.width, textureInfo.height, x, y);
      });
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
    width: 100,   // we don't know the size until it loads
    height: 100,
    texture: tex,
  };
  
  const image: HTMLImageElement = new Image();
  
  image.onload = () => {

    textureInfo.width = image.width;
    textureInfo.height = image.height;

    console.log('image loaded!', image.width, image.height);

    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };

  image.src = url;

  return textureInfo;
};
