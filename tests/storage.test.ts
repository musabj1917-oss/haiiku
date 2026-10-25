import { describe, expect, it } from 'vitest';
import { PrototypeNeonStorageAdapter } from '../apps/api/src/services/storage.js';

describe('Prototype Storage Adapter Interface', () => {
  it('generates a storage URL conforming to the storage interface', async () => {
    const storage = new PrototypeNeonStorageAdapter();
    const url = await storage.getMediaUrl('test_ref_123');
    expect(url).toBe('https://haiku-prototype-storage.internal/media/test_ref_123');
  });
});
