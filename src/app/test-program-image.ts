import getNodeImageProgram from "sigma/rendering/webgl/programs/node.image";
import { NodeDisplayData } from "sigma/types";

// Note: this is a test file for a custom image program
// it renders this image: /assets/img/pokemon.gif
// into 30 square pieces, as a way to test sprite rendering
// this might break if rendering more images (the real offsets on the canvas would not match the hardcoded ones here)

// try to carve up into 30 squares and show each piece of the image
const WIDTH = 450;
const HEIGHT = 299;

const ITEMS = 30;

const I_WIDTH = WIDTH / ITEMS;
const I_HEIGHT = HEIGHT / ITEMS;

const DefaultProgramImage = getNodeImageProgram();
export class TestImageProgram extends DefaultProgramImage {
  process(data: NodeDisplayData & { image?: string }, hidden: boolean, offset: number): void {
    super.process(data, hidden, offset);
    // console.log(this.array);
    // console.log(offset);
    const i = offset * 1 * 8; // 1 = points, 8 = attributes

    // config[4] = 0.2;
    // config[5] = 0.2;
    
    // array[i++] = imageState.x / width; (always 0)
    // array[i++] = imageState.y / height; (always 0)
    // array[i++] = imageState.width / width; (always 1)
    // array[i++] = imageState.height / height; (always 1)
    this.array[i + 4] = offset * (I_WIDTH / WIDTH);
    this.array[i + 5] = offset * (I_HEIGHT / HEIGHT);
    this.array[i + 6] = I_WIDTH / WIDTH;
    this.array[i + 7] = I_HEIGHT / HEIGHT;
    
    if (data.label === 'Philadelphia 76ers (2023)') {
      const [_a, _b, _c, _d, e, f, g, h] = Array.from(this.array.slice(i, i + 8));

      console.log(e, f, g, h);
      // console.log('imageState.x', e as number * WIDTH);
      // console.log('imageState.y' , f as number * HEIGHT);
      // console.log('imageState.width', g as number * WIDTH);
      // console.log('imageState.height', h as number * HEIGHT);

    // console.log(Array.from(this.array.slice(offset, offset + 8)));
    // console.log(this.array.slice(i, i + 8));
  }

  // if (offset === 29) debugger;

    // console.log(offset);
  }
}
