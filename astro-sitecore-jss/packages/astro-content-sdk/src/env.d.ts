/// <reference types="astro/client" />
declare global {
  namespace App {
    interface Locals extends Record<string, any> {
      skipMiddleware?: boolean;
    }
  }
}

export {};