export type SandboxFailure =
  | "compile" // syntax / transform error, or forbidden import
  | "timeout" // exceeded the CPU-time budget (e.g. infinite loop)
  | "memory" // exceeded the memory budget
  | "runtime" // threw while executing
  | "output"; // produced no/oversized/invalid element tree

export class SandboxError extends Error {
  readonly failure: SandboxFailure;
  constructor(failure: SandboxFailure, message: string) {
    super(message);
    this.name = "SandboxError";
    this.failure = failure;
  }
}
