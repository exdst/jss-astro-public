/// <reference types="astro/client" />
declare global {
  namespace App {
    interface Locals extends Record<string, unknown> {
      skipMiddleware?: boolean;
    }
  }
}

export {};
