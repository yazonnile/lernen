type Diff = {
  (
    arr1: string[],
    arr2: string[]
  ): string[];
};

const diff: Diff = (arr1, arr2) => {
  return arr1
    .filter(x => !arr2.includes(x))
    .concat(arr2.filter(x => !arr1.includes(x)));
};

export default diff;
