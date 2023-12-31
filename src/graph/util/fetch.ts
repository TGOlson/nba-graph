import nodeFetch, { Response } from 'node-fetch';

export type Fetch = (str: string) => Promise<Response>;

const delayMS = (t: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), t);
  });
};

export const makeFetch = (verbose = false): Fetch => {
  return (url) => {
    if (verbose) console.log(`[${(new Date()).toISOString()}] Fetching url: ${url}`);
    return nodeFetch(url).then(res => {
      if (res.status !== 200) throw new Error(`Unexpected response. Status: ${res.status}, ${res.statusText}`);
      return res;
    });
  };
};

// Kind of lazy fake-throttling, just add a delay before each request...
export const makeDelayedFetch = (verbose = false, delay: number): Fetch => {
  const fetch = makeFetch(verbose);
  return (url) => delayMS(delay).then(() => fetch(url));
};
