import nodeFetch, { Response } from 'node-fetch';
import https from 'node:https';

export type Fetch = (str) => Promise<Response>

export const makeFetch = (verbose: boolean = false): Fetch => {
  const agent = new https.Agent({ maxSockets: 100 });

  return (url) => {
    if (verbose) console.log(`[${(new Date()).toISOString()}] Fetching url: ${url}`);
    return nodeFetch(url, { agent });
  }
}
