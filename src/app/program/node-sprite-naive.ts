// Note: this is copied directly from https://github.com/jacomyal/sigma.js
// Modified to support cropping base image (specifically to enable sprite images)

/**
 * Sigma.js WebGL Renderer Node Program
 * =====================================
 *
 * Program rendering nodes using GL_POINTS, but that draws an image on top of
 * the classic colored disc.
 * @module
 */
import { Coordinates, Dimensions, NodeDisplayData } from 'sigma/types';
import { floatColor } from 'sigma/utils';
import { AbstractNodeProgram } from 'sigma/rendering/webgl/programs/common/node';
import { RenderParams } from 'sigma/rendering/webgl/programs/common/program';
import Sigma from 'sigma';
import { FRAGMENT_SHADER_GLSL, VERTEX_SHADER_GLSL } from './shaders';
import { SpriteNodeAttributes, Selection } from '../../shared/types';

const POINTS = 1,
  ATTRIBUTES = 8,
  // maximum size of single texture in atlas
  MAX_TEXTURE_SIZE = 192,
  // maximum width of atlas texture (limited by browser)
  // low setting of 3072 works on phones & tablets
  MAX_CANVAS_WIDTH = 3072;

type ImageLoading = { status: 'loading' };
type ImageError = { status: 'error' };
type ImagePending = { status: 'pending'; image: HTMLImageElement, crop?: Selection };
type ImageReady = { status: 'ready' } & Coordinates & Dimensions;
type ImageType = ImageLoading | ImageError | ImagePending | ImageReady;

// This class only exists for the return typing of `getNodeImageProgram`:
class AbstractNodeImageProgram extends AbstractNodeProgram {
  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  constructor(gl: WebGLRenderingContext, renderer: Sigma) {
    super(gl, VERTEX_SHADER_GLSL, FRAGMENT_SHADER_GLSL, POINTS, ATTRIBUTES);
  }
  bind(): void {}
  process(data: NodeDisplayData & { image?: string }, hidden: boolean, offset: number): void {}
  render(params: RenderParams): void {}
  rebindTexture() {}
  /* eslint-enable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
}

const getImageKey = (url: string, crop?: Selection): string => {
  return crop ? `${url}?x=${crop.x}&y=${crop.y}&width=${crop.width}&height=${crop.height}` : url;
};

/**
 * To share the texture between the program instances of the graph and the
 * hovered nodes (to prevent some flickering, mostly), this program must be
 * 'built' for each sigma instance:
 */
export default function makeNodeSpriteProgram(): typeof AbstractNodeImageProgram {
  /**
   * These attributes are shared between all instances of this exact class,
   * returned by this call to getNodeProgramImage:
   */
  const rebindTextureFns: (() => void)[] = [];

  // Images keyed w/ cropping info, to track status of each unique view
  const images: Record<string, ImageType> = {};
  let textureImage: ImageData;
  let hasReceivedImages = false;
  let pendingImagesFrameID: number | undefined = undefined;

  // next write position in texture
  let writePositionX = 0;
  let writePositionY = 0;
  // height of current row
  let writeRowHeight = 0;

  type PendingImage = {
    image: HTMLImageElement;
    id: string;
    size: number;
    crop?: Selection;
  };

  /**
   * Helper to load an image:
   */
  function loadImage(imageSource: string, crop?: Selection): void {
    const imageKey = getImageKey(imageSource, crop);

    if (images[imageKey]) return;

    const image = new Image();
    image.addEventListener('load', () => {
      images[imageKey] = {
        status: 'pending',
        image,
        crop,
      };

      if (typeof pendingImagesFrameID !== 'number') {
        pendingImagesFrameID = requestAnimationFrame(() => finalizePendingImages());
      }
    });
    image.addEventListener('error', () => {
      images[imageKey] = { status: 'error' };
    });
    images[imageKey] = { status: 'loading' };

    // Load image:
    image.setAttribute('crossOrigin', '');
    image.src = imageSource;
  }

  /**
   * Helper that takes all pending images and adds them into the texture:
   */
  function finalizePendingImages(): void {
    pendingImagesFrameID = undefined;

    const pendingImages: PendingImage[] = [];

    // List all pending images:
    for (const id in images) {
      const state = images[id] as ImageType;
      if (state.status === 'pending') {
        pendingImages.push({
          id,
          image: state.image,
          crop: state.crop,
          size: Math.min(state.image.width, state.image.height) || 1,
        });
      }
    }

    // Add images to texture:
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {willReadFrequently: true}) as CanvasRenderingContext2D;

    // limit canvas size to avoid browser and platform limits
    let totalWidth = hasReceivedImages ? textureImage.width : 0;
    let totalHeight = hasReceivedImages ? textureImage.height : 0;

    // initialize image drawing offsets with current write position
    let xOffset = writePositionX;
    let yOffset = writePositionY;

    /**
     * Draws a (full or partial) row of images into the atlas texture
     * @param pendingImages
     */
    const drawRow = (pendingImages: PendingImage[]) => {
      // update canvas size before drawing
      if (canvas.width !== totalWidth || canvas.height !== totalHeight) {
        canvas.width = Math.min(MAX_CANVAS_WIDTH, totalWidth);
        canvas.height = totalHeight;

        // draw previous texture into resized canvas
        if (hasReceivedImages) {
          ctx.putImageData(textureImage, 0, 0);
        }
      }

      pendingImages.forEach(({ id, image, size, crop }) => {
        // Note: this takes the min of height and width for the crop in order to make it equal dimensions
        // This is a bit lazy... we could also center the crop like the code does for non-crop below...
        const srcSize = crop ? Math.min(crop.width, crop.height) : size;

        const imageSizeInTexture = Math.min(MAX_TEXTURE_SIZE, srcSize);

        let dx = 0,
          dy = 0;
        if (crop) {
          dx = crop.x;
          dy = crop.y;
        } else {
          // Crop image, to only keep the biggest square, centered:
          // Note: with cropping modifications above, can probably remove this
          if ((image.width || 0) > (image.height || 0)) {
            dx = (image.width - image.height) / 2;
          } else {
            dy = (image.height - image.width) / 2;
          }
        }

        // ctx.drawImage(image, dx, dy, size, size, xOffset, yOffset, imageSizeInTexture, imageSizeInTexture); // orig
        ctx.drawImage(image, dx, dy, srcSize, srcSize, xOffset, yOffset, imageSizeInTexture, imageSizeInTexture);

        // Update image state:
        images[id] = {
          status: 'ready',
          x: xOffset,
          y: yOffset,
          width: imageSizeInTexture,
          height: imageSizeInTexture,
        };

        xOffset += imageSizeInTexture;
      });

      hasReceivedImages = true;
      textureImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // textureImage = ctx.getImageData(0, 0, canvas.width, canvas.height); // orig
    };

    let rowImages: PendingImage[] = [];
    pendingImages.forEach((image) => {
      const { size } = image;
      const imageSizeInTexture = Math.min(size, MAX_TEXTURE_SIZE);

      if (writePositionX + imageSizeInTexture > MAX_CANVAS_WIDTH) {
        // existing row is full: flush row and continue on next line
        if (rowImages.length > 0) {
          totalWidth = Math.max(writePositionX, totalWidth);
          totalHeight = Math.max(writePositionY + writeRowHeight, totalHeight);
          drawRow(rowImages);

          rowImages = [];
          writeRowHeight = 0;
        }

        writePositionX = 0;
        writePositionY = totalHeight;
        xOffset = 0;
        yOffset = totalHeight;
      }

      // add image to row
      rowImages.push(image);

      // advance write position and update maximum row height
      writePositionX += imageSizeInTexture;
      writeRowHeight = Math.max(writeRowHeight, imageSizeInTexture);
    });

    // flush pending images in row - keep write position (and drawing cursor)
    totalWidth = Math.max(writePositionX, totalWidth);
    totalHeight = Math.max(writePositionY + writeRowHeight, totalHeight);
    drawRow(rowImages);
    rowImages = [];

    rebindTextureFns.forEach((fn) => fn());
  }

  return class NodeImageProgram extends AbstractNodeProgram {
    texture: WebGLTexture;
    textureLocation: GLint;
    atlasLocation: WebGLUniformLocation;
    latestRenderParams?: RenderParams;

    constructor(gl: WebGLRenderingContext, renderer: Sigma) {
      super(gl, VERTEX_SHADER_GLSL, FRAGMENT_SHADER_GLSL, POINTS, ATTRIBUTES);

      rebindTextureFns.push(() => {
        this.rebindTexture();
        renderer.refresh();
      });

      textureImage = new ImageData(1, 1);

      // Attribute Location
      this.textureLocation = gl.getAttribLocation(this.program, 'a_texture');

      // Uniform Location
      const atlasLocation = gl.getUniformLocation(this.program, 'u_atlas');
      if (atlasLocation === null) throw new Error('NodeProgramImage: error while getting atlasLocation');
      this.atlasLocation = atlasLocation;

      // Initialize WebGL texture:
      this.texture = gl.createTexture() as WebGLTexture;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

      this.bind();
    }

    bind(): void {
      super.bind();

      const gl = this.gl;

      gl.enableVertexAttribArray(this.textureLocation);
      gl.vertexAttribPointer(
        this.textureLocation,
        4,
        gl.FLOAT,
        false,
        this.attributes * Float32Array.BYTES_PER_ELEMENT,
        16,
      );
    }

    process(data: NodeDisplayData & SpriteNodeAttributes, hidden: boolean, offset: number): void {
      const array = this.array;
      let i = offset * POINTS * ATTRIBUTES;

      const imageSource = data.image;
      const imageKey = imageSource ? getImageKey(imageSource, data.crop) : '';
      const imageState = imageSource && images[imageKey];

      if (typeof imageSource === 'string' && !imageState) loadImage(imageSource, data.crop);

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

      // Reference texture:
      if (imageState && imageState.status === 'ready') {
        const { width, height } = textureImage;
        array[i++] = imageState.x / width;
        array[i++] = imageState.y / height;
        array[i++] = imageState.width / width;
        array[i++] = imageState.height / height;
      } else {
        array[i++] = 0;
        array[i++] = 0;
        array[i++] = 0;
        array[i++] = 0;
      }
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

    rebindTexture() {
      const gl = this.gl;

      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
      gl.generateMipmap(gl.TEXTURE_2D);

      if (this.latestRenderParams) {
        this.bind();
        this.bufferData();
        this.render(this.latestRenderParams);
      }
    }
  };
}
