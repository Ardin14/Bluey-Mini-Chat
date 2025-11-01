/*
 * Ambient declarations for worker configuration expected by the worker TS build.
 * This file is intentionally minimal — it exists so `tsc` can resolve the
 * `./worker-configuration.d.ts` entry in `tsconfig.worker.json` during CI builds.
 */

declare global {
  // add properties here if your worker build requires global config types
  interface WorkerConfiguration {}
}

export {};
// Minimal worker configuration types for TypeScript build
// This file exists to satisfy tsconfig.worker.json types reference used in the monorepo template

export {};
