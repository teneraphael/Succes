import ky from "ky";

const kyInstance = ky.create({
  // Ajoute cette option pour que les cookies soient TOUJOURS inclus
  credentials: "include", 
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      if (key.endsWith("At")) return new Date(value);
      return value;
    }),
});

export default kyInstance;