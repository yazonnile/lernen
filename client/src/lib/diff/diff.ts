type Diff = {(
  arr1: string[],
  arr2: string[],
)} | {(
  arr1: number[],
  arr2: number[],
)};

const diff: Diff = (arr1, arr2): string[]|number[] => {
  return arr1.reduce((diff, el, i) => {
    if (el !== arr2[i]) {
      diff.push(arr2[i]);
    }

    return diff;
  }, []);
};

export default diff;
