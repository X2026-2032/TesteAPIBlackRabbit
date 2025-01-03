export function sortByDateDescending(array: any[]) {
  return array.sort((a, b) => {
    const dateA = new Date(a.created_at) as any;
    const dateB = new Date(b.created_at) as any;
    return dateB - dateA;
  });
}
