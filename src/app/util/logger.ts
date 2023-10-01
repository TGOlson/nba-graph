export const logDebug = (...args: any[]) => // eslint-disable-line
  process.env.NODE_ENV === 'production' 
    ? console.debug('[debug]', ...args)  // eslint-disable-line
    : console.log('[debug]', ...args); // eslint-disable-line
