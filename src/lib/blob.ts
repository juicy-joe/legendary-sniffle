// A "use server" file may only export async functions (the Server Actions
// convention), so this plain sync helper — needed both inside image-actions.ts
// and directly in Server Components — lives in its own module.
export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
