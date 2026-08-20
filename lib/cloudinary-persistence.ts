export async function persistCloudinaryAsset<T>({
  persist,
  rollback,
}: {
  persist: () => Promise<T>;
  rollback: () => Promise<unknown>;
}) {
  try {
    return await persist();
  } catch (error) {
    await rollback().catch(() => null);
    throw error;
  }
}
