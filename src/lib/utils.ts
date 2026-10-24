import type { ItemStatus, ProjectData, Room, ChecklistItem, PhotoRecord } from '../types';
import { DEFAULT_ROOM_DEFS, DEFAULT_CHECKLIST_ITEMS } from '../types';

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function formatGBP(pence: number): string {
  const pounds = pence / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(pounds);
}

export function parseGBPToPence(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const value = parseFloat(cleaned);
  if (isNaN(value) || value < 0) return 0;
  return Math.round(value * 100);
}

export function formatDate(ts: number | string | null): string {
  if (!ts) return '—';
  const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function createDefaultRooms(): Room[] {
  return DEFAULT_ROOM_DEFS.map((def) => ({
    id: uid(),
    name: def.name,
    icon: def.icon,
    custom: false,
    items: DEFAULT_CHECKLIST_ITEMS.map((label) => ({
      id: uid(),
      label,
      status: 'unchecked' as ItemStatus,
      note: '',
      photoIds: [],
      custom: false,
    })),
  }));
}

export function createEmptyProject(nickname: string = '', isDemo: boolean = false): ProjectData {
  const now = Date.now();
  return {
    id: uid(),
    nickname,
    address: '',
    moveOutDate: '',
    tenancyNotes: '',
    rooms: createDefaultRooms(),
    deductions: [],
    createdAt: now,
    updatedAt: now,
    isDemo,
  };
}

export function countItems(rooms: Room[]): { total: number; completed: number; remaining: number } {
  let total = 0;
  let completed = 0;
  for (const room of rooms) {
    for (const item of room.items) {
      total++;
      if (item.status !== 'unchecked') completed++;
    }
  }
  return { total, completed, remaining: total - completed };
}

export function countRoomItems(room: Room): { total: number; completed: number; remaining: number } {
  let total = room.items.length;
  let completed = room.items.filter((i) => i.status !== 'unchecked').length;
  return { total, completed, remaining: total - completed };
}

export function getIncompleteItems(rooms: Room[]): { roomName: string; itemLabel: string }[] {
  const result: { roomName: string; itemLabel: string }[] = [];
  for (const room of rooms) {
    for (const item of room.items) {
      if (item.status === 'unchecked') {
        result.push({ roomName: room.name, itemLabel: item.label });
      }
    }
  }
  return result;
}

export function getAllPhotoIds(rooms: Room[]): string[] {
  const ids: string[] = [];
  for (const room of rooms) {
    for (const item of room.items) {
      ids.push(...item.photoIds);
    }
  }
  return ids;
}

export interface PhotoSummary {
  id: string;
  roomId: string;
  itemId?: string;
  blob: Blob;
  mimeType: string;
  caption: string;
  note: string;
  dateTaken: string | null;
  createdAt: number;
}

export function photoToRecord(p: PhotoRecord): PhotoSummary {
  return {
    id: p.id,
    roomId: p.roomId,
    itemId: p.itemId,
    blob: p.blob,
    mimeType: p.mimeType,
    caption: p.caption,
    note: p.note,
    dateTaken: p.dateTaken,
    createdAt: p.createdAt,
  };
}

export async function compressImage(
  file: File,
  maxWidth: number = 1280,
  quality: number = 0.72,
): Promise<{ blob: Blob; dateTaken: string | null }> {
  const dateTaken = await extractDateTaken(file);

  // If already small enough and a supported format, keep as-is
  if (file.size < 500_000 && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return { blob: file, dateTaken };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ blob: file, dateTaken });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve({ blob, dateTaken });
          else resolve({ blob: file, dateTaken });
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });
}

async function extractDateTaken(file: File): Promise<string | null> {
  if (file.lastModified) {
    return new Date(file.lastModified).toISOString();
  }
  return null;
}

export function blobToObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function downloadFile(filename: string, content: string | Blob, mimeType: string = 'application/json') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function penceToInputValue(pence: number): string {
  if (pence === 0) return '';
  return (pence / 100).toFixed(2);
}
