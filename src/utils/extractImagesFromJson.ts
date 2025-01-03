import axios from "axios";

async function extractImagesFromJson(jsonData: any, userId: string) {
  const newObject = [];

  for (const key in jsonData) {
    if (Object.prototype.hasOwnProperty.call(jsonData, key)) {
      const element = jsonData[key];

      if (typeof element === "object" && element.typeDocReference) {
        try {
          const response = await axios.get(element.typeDocReference, {
            responseType: "arraybuffer",
          });

          const imageBuffer = Buffer.from(response.data, "binary");
          const base64Image = imageBuffer.toString("base64");

          const type = key === "docFront" ? "FRONT" : "BACK";

          newObject.push({
            type: `${element.type}_${type}`,
            base64: base64Image,
            userId,
          });
        } catch (error) {
          console.error(`Erro ao processar ${key}: ${error}`);
        }
      } else if (
        key === "selfieReference" ||
        key === "PERSON_LEGAL_REVENUES" ||
        key === "PERSON_LEGAL_SOCIAL_CONTRACT"
      ) {
        try {
          const response = await axios.get(element, {
            responseType: "arraybuffer",
          });

          const imageBuffer = Buffer.from(response.data, "binary");
          const base64Image = imageBuffer.toString("base64");

          newObject.push({
            type: key === "selfieReference" ? "SELFIE" : key,
            base64: base64Image,
            userId,
          });
        } catch (error) {
          console.error(`Erro ao processar ${key}: ${error}`);
        }
      }
    }
  }

  return newObject;
}

export { extractImagesFromJson };
