type GetFirstMismatch = {
    (
    arr1: string[],
    arr2: string[]
  ): string[];
} | {
  (
    arr1: number[],
    arr2: number[]
  ): number[];
};

const getFirstMismatch: GetFirstMismatch = (arr1, arr2) => {
  const length = Math.max(arr1.length, arr2.length);
  for (let i = 0; i < length; i++) {
    if (arr1[i] !== arr2[i]) {
      return [arr1[i], arr2[i]];
    }
  }

  return [];
};

export default getFirstMismatch;
