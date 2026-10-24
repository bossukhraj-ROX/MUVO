import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { ProjectData, Room, ChecklistItem, Deduction, PhotoRecord } from '../types';
import {
  dbGetProject,
  dbPutProject,
  dbDeleteProject,
  dbPutPhoto,
  dbGetAllPhotos,
  dbDeletePhoto,
  dbDeletePhotos,
} from './db';
import { createEmptyProject, createDefaultRooms, uid, getAllPhotoIds } from './utils';
import { demoProject } from './demoData';

const STORAGE_KEY = 'muvo:active-project-id';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface ProjectContextValue {
  project: ProjectData | null;
  loading: boolean;
  saveState: SaveState;
  photos: Map<string, PhotoRecord>;
  startProject: (nickname: string, address: string, moveOutDate: string, tenancyNotes: string) => void;
  loadDemo: () => void;
  loadProject: (id: string) => Promise<void>;
  updateProject: (patch: Partial<ProjectData>) => void;
  addRoom: (name: string) => void;
  renameRoom: (roomId: string, name: string) => void;
  deleteRoom: (roomId: string) => void;
  addItem: (roomId: string, label: string) => void;
  updateItem: (roomId: string, itemId: string, patch: Partial<ChecklistItem>) => void;
  deleteItem: (roomId: string, itemId: string) => void;
  addPhoto: (photo: PhotoRecord) => Promise<void>;
  updatePhoto: (id: string, patch: Partial<PhotoRecord>) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  addDeduction: (d: Omit<Deduction, 'id' | 'createdAt'>) => void;
  updateDeduction: (id: string, patch: Partial<Deduction>) => void;
  deleteDeduction: (id: string) => void;
  deleteEverything: () => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (json: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [photos, setPhotos] = useState<Map<string, PhotoRecord>>(new Map());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  // Load active project on mount
  useEffect(() => {
    (async () => {
      const activeId = localStorage.getItem(STORAGE_KEY);
      if (activeId) {
        try {
          const p = (await dbGetProject(activeId)) as ProjectData | undefined;
          if (p) {
            setProject(p);
            await loadPhotos(p);
          }
        } catch {
          // ignore
        }
      }
      setLoading(false);
    })();
  }, []);

  async function loadPhotos(p: ProjectData) {
    const photoIds = getAllPhotoIds(p.rooms);
    if (photoIds.length === 0) {
      setPhotos(new Map());
      return;
    }
    const all = (await dbGetAllPhotos()) as PhotoRecord[];
    const map = new Map<string, PhotoRecord>();
    for (const ph of all) {
      if (photoIds.includes(ph.id)) {
        map.set(ph.id, ph);
      }
    }
    setPhotos(map);
  }

  // Persist project on changes (debounced)
  useEffect(() => {
    if (!project || skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState('saving');
    saveTimer.current = setTimeout(async () => {
      try {
        const toSave = { ...project, updatedAt: Date.now() };
        await dbPutProject(toSave);
        localStorage.setItem(STORAGE_KEY, toSave.id);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      } catch {
        setSaveState('error');
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [project]);

  const startProject = useCallback(
    (nickname: string, address: string, moveOutDate: string, tenancyNotes: string) => {
      const p = createEmptyProject(nickname, false);
      p.address = address;
      p.moveOutDate = moveOutDate;
      p.tenancyNotes = tenancyNotes;
      setProject(p);
    },
    [],
  );

  const loadDemo = useCallback(() => {
    const p = structuredClone(demoProject);
    p.id = uid();
    p.isDemo = true;
    p.createdAt = Date.now();
    p.updatedAt = Date.now();
    skipNextSave.current = true;
    setProject(p);
    setPhotos(new Map()); // demo photos are inline
    localStorage.setItem(STORAGE_KEY, p.id);
    // Save demo project to db
    dbPutProject(p).catch(() => {});
  }, []);

  const loadProject = useCallback(async (id: string) => {
    const p = (await dbGetProject(id)) as ProjectData | undefined;
    if (p) {
      setProject(p);
      await loadPhotos(p);
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const updateProject = useCallback((patch: Partial<ProjectData>) => {
    setProject((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const addRoom = useCallback((name: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const room: Room = {
        id: uid(),
        name,
        icon: 'map',
        custom: true,
        items: [],
      };
      return { ...prev, rooms: [...prev.rooms, room] };
    });
  }, []);

  const renameRoom = useCallback((roomId: string, name: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map((r) => (r.id === roomId ? { ...r, name } : r)),
      };
    });
  }, []);

  const deleteRoom = useCallback((roomId: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const room = prev.rooms.find((r) => r.id === roomId);
      if (room) {
        const photoIds = room.items.flatMap((i) => i.photoIds);
        if (photoIds.length) dbDeletePhotos(photoIds).catch(() => {});
      }
      return { ...prev, rooms: prev.rooms.filter((r) => r.id !== roomId) };
    });
  }, []);

  const addItem = useCallback((roomId: string, label: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map((r) =>
          r.id === roomId
            ? {
                ...r,
                items: [
                  ...r.items,
                  { id: uid(), label, status: 'unchecked', note: '', photoIds: [], custom: true } as ChecklistItem,
                ],
              }
            : r,
        ),
      };
    });
  }, []);

  const updateItem = useCallback((roomId: string, itemId: string, patch: Partial<ChecklistItem>) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map((r) =>
          r.id === roomId
            ? {
                ...r,
                items: r.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
              }
            : r,
        ),
      };
    });
  }, []);

  const deleteItem = useCallback((roomId: string, itemId: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const room = prev.rooms.find((r) => r.id === roomId);
      const item = room?.items.find((i) => i.id === itemId);
      if (item && item.photoIds.length) {
        dbDeletePhotos(item.photoIds).catch(() => {});
      }
      return {
        ...prev,
        rooms: prev.rooms.map((r) =>
          r.id === roomId
            ? { ...r, items: r.items.filter((i) => i.id !== itemId) }
            : r,
        ),
      };
    });
  }, []);

  const addPhoto = useCallback(async (photo: PhotoRecord) => {
    await dbPutPhoto(photo);
    setPhotos((prev) => {
      const next = new Map(prev);
      next.set(photo.id, photo);
      return next;
    });
  }, []);

  const updatePhoto = useCallback(async (id: string, patch: Partial<PhotoRecord>) => {
    setPhotos((prev) => {
      const existing = prev.get(id);
      if (!existing) return prev;
      const updated = { ...existing, ...patch };
      dbPutPhoto(updated).catch(() => {});
      const next = new Map(prev);
      next.set(id, updated);
      return next;
    });
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    await dbDeletePhoto(id);
    setPhotos((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    // Also remove from project item
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map((r) => ({
          ...r,
          items: r.items.map((i) => ({
            ...i,
            photoIds: i.photoIds.filter((pid) => pid !== id),
          })),
        })),
      };
    });
  }, []);

  const addDeduction = useCallback((d: Omit<Deduction, 'id' | 'createdAt'>) => {
    setProject((prev) => {
      if (!prev) return prev;
      const deduction: Deduction = { ...d, id: uid(), createdAt: Date.now() };
      return { ...prev, deductions: [...prev.deductions, deduction] };
    });
  }, []);

  const updateDeduction = useCallback((id: string, patch: Partial<Deduction>) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        deductions: prev.deductions.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      };
    });
  }, []);

  const deleteDeduction = useCallback((id: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      return { ...prev, deductions: prev.deductions.filter((d) => d.id !== id) };
    });
  }, []);

  const deleteEverything = useCallback(async () => {
    if (project) {
      const photoIds = getAllPhotoIds(project.rooms);
      if (photoIds.length) await dbDeletePhotos(photoIds).catch(() => {});
      await dbDeleteProject(project.id).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    setProject(null);
    setPhotos(new Map());
  }, [project]);

  const exportBackup = useCallback(async (): Promise<string> => {
    if (!project) return '';
    const photoIds = getAllPhotoIds(project.rooms);
    const photoRecords: { id: string; base64: string; mimeType: string }[] = [];
    for (const id of photoIds) {
      const ph = photos.get(id);
      if (ph) {
        const base64 = await blobToBase64(ph.blob);
        photoRecords.push({ id, base64, mimeType: ph.mimeType });
      }
    }
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      project,
      photos: photoRecords,
    };
    return JSON.stringify(backup, null, 2);
  }, [project, photos]);

  const importBackup = useCallback(async (json: string): Promise<boolean> => {
    try {
      const data = JSON.parse(json);
      if (!data.project || !data.project.id) return false;
      const importedProject = data.project as ProjectData;
      // Restore photos
      if (data.photos && Array.isArray(data.photos)) {
        for (const ph of data.photos) {
          const blob = base64ToBlob(ph.base64, ph.mimeType);
          const record: PhotoRecord = {
            id: ph.id,
            roomId: '',
            blob,
            mimeType: ph.mimeType,
            caption: '',
            note: '',
            dateTaken: null,
            createdAt: Date.now(),
          };
          await dbPutPhoto(record);
        }
      }
      await dbPutProject(importedProject);
      localStorage.setItem(STORAGE_KEY, importedProject.id);
      skipNextSave.current = true;
      setProject(importedProject);
      await loadPhotos(importedProject);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        project,
        loading,
        saveState,
        photos,
        startProject,
        loadDemo,
        loadProject,
        updateProject,
        addRoom,
        renameRoom,
        deleteRoom,
        addItem,
        updateItem,
        deleteItem,
        addPhoto,
        updatePhoto,
        deletePhoto,
        addDeduction,
        updateDeduction,
        deleteDeduction,
        deleteEverything,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new Blob([arr], { type: mimeType });
}
