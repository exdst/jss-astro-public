/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="astro/client" />
declare global {
  namespace App {
    interface Locals extends Record<string, any> {
      skipMiddleware?: boolean;
    }
  }
}

export {};