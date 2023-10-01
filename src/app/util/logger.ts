export const logDebug = (...args: any[]) => // eslint-disable-line
  process.env.NODE_ENV === 'development' 
    ? console.log('[debug]', ...args)    // eslint-disable-line
    : console.debug('[debug]', ...args); // eslint-disable-line
