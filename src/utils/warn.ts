export enum WARN_LEVEL {
  'WARN' = 1,
  'DANGER' = 2,
  'ERROR' = 3,
}
export const Warn = (err: string, level: WARN_LEVEL = 1) => {
  if (level === 1) {
    console.error('warning:', err);
  }
  if (level === 2) {
    console.error('error:', err);
  }
  if (level === 3) {
    throw new Error(err);
  }
};
