import Sigma from "sigma";
import { INodeProgram } from "sigma/rendering/webgl/programs/common/node";
import { RenderParams } from "sigma/rendering/webgl/programs/common/program";
import { NodeDisplayData } from "sigma/types";
import { createDrawer, DEFAULT_DRAW_SPEC, Drawer, DrawParams, loadImageAndCreateTextureInfo } from "./test";

// This class only exists for the return typing of `getNodeImageProgram`:
export class SpriteNodeImageProgram implements INodeProgram  {
  images: {[key: string]: DrawParams} = {};
  drawer: Drawer;
  gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, _renderer: Sigma) {
    this.gl = gl;
    this.drawer = createDrawer(gl);
  }

  bufferData(): void {
    return;
  }

  allocate(_capacity: number): void {
    return;
  }
  bind(): void {
    // super.bind();
    return;
  }
  // bind(): void {}
  process(data: NodeDisplayData & { image?: string }, _hidden: boolean, _offset: number): void {
    console.log('processing');

    if(data.image && !this.images[data.image]) {
      const textureInfo = loadImageAndCreateTextureInfo(this.gl, data.image);

      // todo, maybe should be full drawspec given we should know config from node display data?
      this.images[data.image] = {
        textureInfo,
        src: DEFAULT_DRAW_SPEC,
        dest: {...DEFAULT_DRAW_SPEC, x: data.x, y: data.y}
      };
    } else if (data.image) {
      console.log('already have texture', this.images[data.image]);
    }
  }
  render(params: RenderParams): void {
    if (Object.values(this.images).length === 0) return;

    const drawParams = Object.values(this.images).map(x => {
      return {...x, dest: {
        x: x.dest.x / params.correctionRatio,
        y: x.dest.y / params.correctionRatio,
        width: (x.dest.width || x.src.width || x.textureInfo.width) / params.correctionRatio,
        height: (x.dest.height || x.src.height || x.textureInfo.height) / params.correctionRatio,
      }};
    });

    console.log('rendering', drawParams, params);
    this.drawer.draw(drawParams);
  }
}
