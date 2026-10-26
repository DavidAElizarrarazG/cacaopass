import type { TechLogoKey } from "./tech-logos";

export const TEAM = [
  { name: "David Alejandro Elizarraraz García", id: "220437" },
  { name: "Diego Sastre Villaseñor", id: "221320" },
];

export const COURSE = {
  subject: "Aplicaciones Móviles",
  group: "900CIB",
  teacher: "Felipe Mandujano Gómez",
  date: "Octubre de 2026",
};

type Tech = { logo: TechLogoKey | null; name: string; role: string };

// Lo que se usó para construir la app.
export const APP_STACK: Tech[] = [
  { logo: "react", name: "React Native", role: "Interfaz de la app" },
  { logo: "expo", name: "Expo SDK 57 + Expo Router", role: "Compilación, módulos y navegación" },
  { logo: "typescript", name: "TypeScript", role: "Lógica de pantallas y API" },
  { logo: "kotlin", name: "Kotlin", role: "Módulo nativo de emulación de tarjeta" },
  { logo: "android", name: "Android HCE", role: "Host Card Emulation y protocolo APDU" },
];

// Las piezas del sistema de acceso con las que la app se comunica.
export const SYSTEM_STACK: Tech[] = [
  { logo: "arduino", name: "Arduino Nano ESP32", role: "Escáner de la puerta" },
  { logo: "espressif", name: "ESP32-S3", role: "Wi-Fi y consulta HTTP" },
  { logo: null, name: "Elechouse PN532 v3", role: "Lector NFC en modo HSU" },
  { logo: "nodejs", name: "Node.js", role: "Servidor del sistema" },
  { logo: "express", name: "Express", role: "Endpoint del escáner y panel" },
  { logo: "mysql", name: "MySQL", role: "Usuarios y su estado" },
];
