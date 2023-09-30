// Note: this is mainly copied from https://github.com/jacomyal/sigma.js
// Modified to use a large sprite file, and to use triangles rendering for better resolution
// => https://github.com/jacomyal/sigma.js/pull/1206/files#diff-dcd59c129b10e8a7369ea98a6d576d8a40fbf150e06ca94e5177ee4e531a4987

import { NodeDisplayData } from 'sigma/types';
import { floatColor } from 'sigma/utils';
import { AbstractNodeProgram } from 'sigma/rendering/webgl/programs/common/node';
import { RenderParams } from 'sigma/rendering/webgl/programs/common/program';
import Sigma from 'sigma';

import { FRAGMENT_SHADER_GLSL, VERTEX_SHADER_GLSL } from './shaders-triangles';
import { NodeAttributes } from '../../shared/types';
import { logDebug } from '../util/logger';
import { Sprite } from '../util/types';

const POINTS = 3;
  //  atttributes sizing in floats:
  //   - position (xy: 2xfloat)
  //   - size (1xfloat)
  //   - color (4xbyte => 1xfloat)
  //   - uvw (3xfloat) - only pass width for square texture
  //   - angle (1xfloat)
  //   - borderColor (4xbyte = 1xfloat)
  //   - mutedImage (1xfloat)
const ATTRIBUTES = 10;

const ANGLE_1 = 0.0;
const ANGLE_2 = (2 * Math.PI) / 3;
const ANGLE_3 = (4 * Math.PI) / 3;

const MUTED_COLOR = floatColor('#edebeb');

const R_CONST = (8 / 3) * (1 - Math.sin((2 * Math.PI) / 3));

export default function makeNodeSpriteProgramTriangles(sprite: Sprite) {
  const debugKey = sprite.key;
  const textureImage = sprite.image;

  logDebug(`[node-image-program/${debugKey}]`, 'Texture image size:', textureImage.width, 'x', textureImage.height);

  return class NodeImageProgram extends AbstractNodeProgram {
    texture: WebGLTexture;
    textureLocation: GLint;
    atlasLocation: WebGLUniformLocation;
    sqrtZoomRatioLocation: WebGLUniformLocation;
    correctionRatioLocation: WebGLUniformLocation;
    angleLocation: GLint;
    borderColorLocation: GLint;
    mutedImageLocation: GLint;
    latestRenderParams?: RenderParams;

    constructor(gl: WebGLRenderingContext, _renderer: Sigma) {
      super(gl, VERTEX_SHADER_GLSL, FRAGMENT_SHADER_GLSL, POINTS, ATTRIBUTES);

      logDebug(`[node-image-program/${debugKey}]`, 'Creating node sprite program instance');

      // Attribute Location
      this.textureLocation = gl.getAttribLocation(this.program, "a_texture");
      this.angleLocation = gl.getAttribLocation(this.program, "a_angle");
      this.borderColorLocation = gl.getAttribLocation(this.program, "a_borderColor");
      this.mutedImageLocation = gl.getAttribLocation(this.program, "a_mutedImage");

      // Uniform Location
      const atlasLocation = gl.getUniformLocation(this.program, "u_atlas");
      if (atlasLocation === null) throw new Error("NodeProgramImage: error while getting atlasLocation");
      this.atlasLocation = atlasLocation;

      const sqrtZoomRatioLocation = gl.getUniformLocation(this.program, "u_sqrtZoomRatio");
      if (sqrtZoomRatioLocation === null) throw new Error("NodeProgram: error while getting sqrtZoomRatioLocation");
      this.sqrtZoomRatioLocation = sqrtZoomRatioLocation;

      const correctionRatioLocation = gl.getUniformLocation(this.program, "u_correctionRatio");
      if (correctionRatioLocation === null) throw new Error("NodeProgram: error while getting correctionRatioLocation");
      this.correctionRatioLocation = correctionRatioLocation;

      // Initialize WebGL texture:
      this.texture = gl.createTexture() as WebGLTexture;

      // console.log('this.texture', this.texture)
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.enableVertexAttribArray(this.textureLocation);
      gl.enableVertexAttribArray(this.angleLocation);
      gl.enableVertexAttribArray(this.borderColorLocation);
      gl.enableVertexAttribArray(this.mutedImageLocation);

      gl.vertexAttribPointer(this.textureLocation, 3, gl.FLOAT, false, this.attributes * Float32Array.BYTES_PER_ELEMENT, 16,);
      gl.vertexAttribPointer(this.angleLocation, 1, gl.FLOAT, false, this.attributes * Float32Array.BYTES_PER_ELEMENT, 28,);
      gl.vertexAttribPointer(this.borderColorLocation, 4, gl.UNSIGNED_BYTE, true, this.attributes * Float32Array.BYTES_PER_ELEMENT, 32,);
      gl.vertexAttribPointer(this.mutedImageLocation, 1, gl.FLOAT, false, this.attributes * Float32Array.BYTES_PER_ELEMENT, 36,);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    process(data: NodeDisplayData & NodeAttributes, hidden: boolean, offset: number): void {
      const array = this.array;
      let i = offset * POINTS * ATTRIBUTES;

      if (hidden) {
        // x,y,size,color
        array[i++] = 0;
        array[i++] = 0;
        array[i++] = 0;
        array[i++] = 0;
        // Texture:
        array[i++] = 0;
        array[i++] = 0;
        array[i++] = 0;
        // Angle:
        array[i++] = 0;
        // Border Color:
        array[i++] = 0;
        // Muted Image:
        array[i++] = 0;
        return;
      }

      const { width, height } = textureImage;
      
      const crop = data.crop;
      const color = data.muted ? MUTED_COLOR : floatColor(data.color);
      const borderColor = data.muted ? MUTED_COLOR : floatColor(data.borderColor);

      // POINT 1
      array[i++] = data.x;
      array[i++] = data.y;
      array[i++] = data.size;
      array[i++] = color;
      // ANGLE_1: center right UV coordinates
      // inscribing circle at (x,y): r=2/3*h, texture (0,0) is top-left
      // texture width is scaled by 2/3 from full triangle width -> uv *1.5
      array[i++] = crop.x / width + (1.5 * crop.width) / width;
      array[i++] = crop.y / height + (0.5 * crop.height) / height;
      array[i++] = 1;
      array[i++] = ANGLE_1;
      array[i++] = borderColor;
      array[i++] = data.muted ? 1 : 0;

      // POINT 2
      array[i++] = data.x;
      array[i++] = data.y;
      array[i++] = data.size;
      array[i++] = color;
      // ANGLE_2: top left UV coordinates
      array[i++] = crop.x / width;
      array[i++] = crop.y / height - (R_CONST * crop.height) / height;
      array[i++] = 1;
      array[i++] = ANGLE_2;
      array[i++] = borderColor;
      array[i++] = data.muted ? 1 : 0;

      // POINT 3
      array[i++] = data.x;
      array[i++] = data.y;
      array[i++] = data.size;
      array[i++] = color;
      // ANGLE_3: bottom left UV coordinates
      array[i++] = crop.x / width;
      array[i++] = crop.y / height + (1 + R_CONST) * (crop.height / height);
      array[i++] = 1;
      array[i++] = ANGLE_3;
      array[i++] = borderColor;
      array[i++] = data.muted ? 1 : 0;
    }

    render(params: RenderParams): void {
      if (this.hasNothingToRender()) return;

      this.latestRenderParams = params;

      const gl = this.gl;

      const program = this.program;
      gl.useProgram(program);

      gl.uniform1f(this.ratioLocation, 1 / Math.sqrt(params.ratio));
      gl.uniform1f(this.scaleLocation, params.scalingRatio);
      gl.uniform1f(this.correctionRatioLocation, params.correctionRatio);
      gl.uniform1f(this.sqrtZoomRatioLocation, Math.sqrt(params.ratio));
      gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix);
      gl.uniform1i(this.atlasLocation, 0);

      // TODO: is there a better way to swap between textures?
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      gl.drawArrays(gl.TRIANGLES, 0, this.array.length / ATTRIBUTES);
    }
  };
}
