export default function sortObjectsByProperty(arr, p) {
  return arr.sort(sortByProperty(p));
}

export function sortByProperty(p) {
  return (a, b) => {
    if (a[p] < b[p]) {
      return -1;
    }

    if (a[p] > b[p]) {
      return 1;
    }

    return 0;
  };
}
