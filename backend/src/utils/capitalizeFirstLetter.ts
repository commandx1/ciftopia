export default function capitalizeFirstLetter(word: string) {
  const updated = word.charAt(0).toUpperCase() + word.slice(1);
  return updated;
}
