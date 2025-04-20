import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "../../sheets.json");

export function readData(): any[] {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function writeData(data: any[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
