export default function generateRandomNumber(lenght = 5): string {
  let number = "";

  for (let i = 0; i < lenght; i++) {
    number += Math.round(Math.random() * 0.9);
  }

  return number;
}
