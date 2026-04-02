/* eslint-disable spaced-comment */
/* eslint-disable no-unused-vars */
/// <reference types="astro/client" />
declare global {
  namespace App {
    interface Locals extends Record<string, any> {
      skipMiddleware?: boolean;
    }
  }
}

export {};