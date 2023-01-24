import { Coordinates, Dimensions } from "sigma/types";
import { Location } from "../../shared/sprite";

export const getImageKey = (url: string, crop?: Location): string => {
  return crop ? `${url}?x=${crop.x}&y=${crop.y}&width=${crop.width}&height=${crop.height}` : url;
};

export type ImageLoading = { status: 'loading' };
export type ImageError = { status: 'error' };
export type ImagePending = { status: 'pending'; image: HTMLImageElement, crop?: Location };
export type ImageReady = { status: 'ready' } & Coordinates & Dimensions;
export type ImageType = ImageLoading | ImageError | ImagePending | ImageReady;

export const pendingImage = (img: HTMLImageElement): ImagePending => ({ status: 'pending', image: img });
