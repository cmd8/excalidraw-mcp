import type { ExcalidrawFile } from '@/diagram/types';

export type ReadHandlerResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type WriteHandlerResult =
  | { ok: true; file: ExcalidrawFile; message: string }
  | { ok: false; error: string };
