const convertStringToBool = (s: string): boolean => {
  const v = s.toLowerCase();
  return v === '1' || v === 'true';
};

export const strToBool = (s: string | undefined | null, defaultVal = false): boolean => {
  if (s === null || s === undefined) {
    return defaultVal;
  }
  return convertStringToBool(s);
};
