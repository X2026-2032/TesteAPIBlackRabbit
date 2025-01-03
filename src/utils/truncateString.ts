export function truncateString(str: string) {
  const limit = 22;
  if (str.length > limit) {
    return str.substring(0, limit) + "...";
  }
  return str;
}
