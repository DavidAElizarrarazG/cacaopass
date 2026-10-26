import { NativeModule, requireOptionalNativeModule } from "expo";

export type NfcStatus = {
  hasNfc: boolean;
  nfcEnabled: boolean;
  hasHce: boolean;
  isDefaultForAid: boolean;
};

export type ReaderDetectedEvent = {
  credentialSent: boolean;
  response: string;
  timestamp: number;
};

export type ReaderLostEvent = { reason: "linkLoss" | "deselected" };

type CacaoHceEvents = {
  onReaderDetected(event: ReaderDetectedEvent): void;
  onReaderLost(event: ReaderLostEvent): void;
};

declare class CacaoHceModule extends NativeModule<CacaoHceEvents> {
  getStatus(): NfcStatus;
  setCredential(userId: number): void;
  clearCredential(): void;
  getCredential(): number | null;
  setLittleEndian(littleEndian: boolean): void;
  isLittleEndian(): boolean;
  simulateSelect(): { command: string; response: string };
  openNfcSettings(): void;
}

// null en web, iOS o Expo Go: ahí la app funciona, pero no puede emular la credencial.
const CacaoHce = requireOptionalNativeModule<CacaoHceModule>("CacaoHce");

export default CacaoHce;
