import Jimp from 'jimp/es';

export async function convertToBW(inputPath: string, outputPath: string): Promise<void> {
  const image = await Jimp.read(inputPath);

  image
    .greyscale()
    .opacity(0.5)
    .background(0xE2E2E2)
    .write(outputPath);
}
