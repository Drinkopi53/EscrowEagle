/**
 * Utility functions for handling BigInt serialization
 */

/**
 * JSON.stringify replacer function that converts BigInt to string
 */
export const bigIntReplacer = (key: string, value: any): any => {
  return typeof value === 'bigint' ? value.toString() : value;
};

/**
 * Safe JSON.stringify that handles BigInt values
 */
export const safeStringify = (obj: any, space?: number): string => {
  return JSON.stringify(obj, bigIntReplacer, space);
};

/**
 * Convert BigInt values in an object to strings recursively
 */
export const convertBigIntToString = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertBigIntToString(value);
    }
    return result;
  }
  
  return obj;
};