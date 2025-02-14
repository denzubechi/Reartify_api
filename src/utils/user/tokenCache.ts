import NodeCache from 'node-cache';

const tokenCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export default tokenCache;

export function checkIfVerificationCodeIsValid(verificationCode: string): boolean {
  return tokenCache.has(verificationCode);
}
