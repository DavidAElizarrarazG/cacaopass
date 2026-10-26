// Copia de simple-icons (licencia CC0) solo los logotipos oficiales que usa la pantalla de créditos,
// para no empaquetar los más de 3000 íconos del paquete en la app.
// Uso: node tools/extract-logos.mjs
import { writeFileSync } from "node:fs";
import * as icons from "simple-icons";

const PICK = {
  react: "siReact",
  expo: "siExpo",
  typescript: "siTypescript",
  kotlin: "siKotlin",
  android: "siAndroid",
  arduino: "siArduino",
  espressif: "siEspressif",
  nodejs: "siNodedotjs",
  express: "siExpress",
  mysql: "siMysql",
};

const entries = Object.entries(PICK).map(([key, name]) => {
  const icon = icons[name];
  if (!icon) throw new Error(`simple-icons no tiene ${name}`);
  return `  ${key}: { title: ${JSON.stringify(icon.title)}, hex: "#${icon.hex}", path: ${JSON.stringify(icon.path)} },`;
});

const file = `// Generado por tools/extract-logos.mjs a partir de simple-icons (CC0). No editar a mano.
export const TECH_LOGOS = {
${entries.join("\n")}
} as const;

export type TechLogoKey = keyof typeof TECH_LOGOS;
`;

writeFileSync(new URL("../src/data/tech-logos.ts", import.meta.url), file);
console.log(`src/data/tech-logos.ts: ${entries.length} logotipos`);
