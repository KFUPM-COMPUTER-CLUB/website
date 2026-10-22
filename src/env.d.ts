/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: { id: string; email: string | null } | null;
    profile: import('./lib/types').Profile | null;
    role: import('./lib/types').Role | 'guest';
  }
}
