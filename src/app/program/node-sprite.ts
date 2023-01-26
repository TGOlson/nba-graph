// Note: this is copied from https://github.com/jacomyal/sigma.js
// But modified heavily to support sprites, with plenty of *hacky* performance optimizations

import { Coordinates, NodeDisplayData } from 'sigma/types';
import { floatColor } from 'sigma/utils';
import { AbstractNodeProgram } from 'sigma/rendering/webgl/programs/common/node';
import { RenderParams } from 'sigma/rendering/webgl/programs/common/program';
import Sigma from 'sigma';

import { FRAGMENT_SHADER_GLSL, VERTEX_SHADER_GLSL } from './shaders';
import { SpriteNodeAttributes } from '../../shared/types';

const POINTS = 1;
const ATTRIBUTES = 8;

export default function makeNodeSpriteProgram(sprite: {offsets: {[key: string]: Coordinates}, img: ImageData}) {
  const textureImage = sprite.img;

  console.log('Texture image array length:', textureImage.data.length, `(${textureImage.data.length / 1000/ 1000}M)`);
  console.log('Texture image array size:', textureImage.data.length / 4, 'bytes', `(${(textureImage.data.length / 4 / 1024 / 1024).toFixed(1)}MB)`);

  return class NodeImageProgram extends AbstractNodeProgram {
    texture: WebGLTexture;
    textureLocation: GLint;
    atlasLocation: WebGLUniformLocation;
    latestRenderParams?: RenderParams;

    constructor(gl: WebGLRenderingContext, _renderer: Sigma) {
      super(gl, VERTEX_SHADER_GLSL, FRAGMENT_SHADER_GLSL, POINTS, ATTRIBUTES);

      // debug logging
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
      console.log('Max texture size (max dimension)', maxTextureSize);
      const maxTextureBytes = maxTextureSize * maxTextureSize * 4;
      console.log('Max texture size', maxTextureBytes, 'bytes', `(${maxTextureBytes / 1024 / 1024}MB)`);

      // Attribute Location
      this.textureLocation = gl.getAttribLocation(this.program, 'a_texture');

      // Uniform Location
      const atlasLocation = gl.getUniformLocation(this.program, 'u_atlas');
      if (atlasLocation === null) throw new Error('NodeProgramImage: error while getting atlasLocation');
      this.atlasLocation = atlasLocation;

      // Initialize WebGL texture:
      this.texture = gl.createTexture() as WebGLTexture;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.enableVertexAttribArray(this.textureLocation);
      gl.vertexAttribPointer(
        this.textureLocation,
        4,
        gl.FLOAT,
        false,
        this.attributes * Float32Array.BYTES_PER_ELEMENT,
        16,
      );

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    process(data: NodeDisplayData & SpriteNodeAttributes, hidden: boolean, offset: number): void {
      const array = this.array;
      let i = offset * POINTS * ATTRIBUTES;

      if (hidden) {
        array[i++] = 0;
        array[i++] = 0;
        array[i++] = 0;
        array[i++] = 0;
        // Texture:
        array[i++] = 0;
        array[i++] = 0;
        array[i++] = 0;
        array[i++] = 0;
        return;
      }

      array[i++] = data.x;
      array[i++] = data.y;
      array[i++] = data.size;
      array[i++] = floatColor(data.color);

      const { width, height } = textureImage;
      const crop = data.crop;

      if (!crop) throw new Error(`Unexpected no crop coords for node: ${JSON.stringify(data)}`);
      if (!data.image) throw new Error(`Unexpected no image url for node: ${JSON.stringify(data)}`);
      
      const spriteOffset = sprite.offsets[data.image];
      if (!spriteOffset) throw new Error(`Unexpected no sprite offset for node: ${JSON.stringify(data)}`);

      array[i++] = (crop.x + spriteOffset.x) / width;
      array[i++] = (crop.y + spriteOffset.y) / height;
      array[i++] = crop.width / width;
      array[i++] = crop.height / height;
    }

    render(params: RenderParams): void {
      if (this.hasNothingToRender()) return;

      this.latestRenderParams = params;

      const gl = this.gl;

      const program = this.program;
      gl.useProgram(program);

      gl.uniform1f(this.ratioLocation, 1 / Math.sqrt(params.ratio));
      gl.uniform1f(this.scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix);
      gl.uniform1i(this.atlasLocation, 0);

      gl.drawArrays(gl.POINTS, 0, this.array.length / ATTRIBUTES);
    }
  };
}
