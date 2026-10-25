import { query } from '../db.js';

export interface StorageAdapter {
  uploadMedia(ownerId: string, kind: 'image' | 'video' | 'audio', mimeType: string, buffer: Buffer): Promise<{ mediaId: string; storageRef: string }>;
  getMediaUrl(storageRef: string): Promise<string>;
}

export class PrototypeNeonStorageAdapter implements StorageAdapter {
  async uploadMedia(ownerId: string, kind: 'image' | 'video' | 'audio', mimeType: string, buffer: Buffer) {
    const storageRef = `prototype_media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const rows = await query<{ id: string }>(
      `INSERT INTO media_assets (owner_id, kind, mime_type, storage_ref, bytes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [ownerId, kind, mimeType, storageRef, buffer.length]
    );

    return { mediaId: rows[0].id, storageRef };
  }

  async getMediaUrl(storageRef: string): Promise<string> {
    return `https://haiku-prototype-storage.internal/media/${storageRef}`;
  }
}

export const mediaStorage = new PrototypeNeonStorageAdapter();
