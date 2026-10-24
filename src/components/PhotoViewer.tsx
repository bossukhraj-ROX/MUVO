import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PhotoRecord } from '../types';
import { formatDate } from '../lib/utils';
import './PhotoViewer.css';

interface PhotoViewerProps {
  photos: PhotoRecord[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

export default function PhotoViewer({ photos, index, onClose, onIndexChange }: PhotoViewerProps) {
  const [urls, setUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const map = new Map<string, string>();
    for (const p of photos) {
      map.set(p.id, URL.createObjectURL(p.blob));
    }
    setUrls(map);
    return () => {
      for (const url of map.values()) URL.revokeObjectURL(url);
    };
  }, [photos]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1);
      if (e.key === 'ArrowRight' && index < photos.length - 1) onIndexChange(index + 1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, photos.length, onClose, onIndexChange]);

  if (photos.length === 0) return null;
  const photo = photos[index];
  if (!photo) return null;
  const url = urls.get(photo.id);

  return (
    <div className="photo-viewer" onClick={onClose}>
      <button className="pv-close focus-ring" onClick={onClose} aria-label="Close photo viewer">
        <X size={24} />
      </button>
      {index > 0 && (
        <button
          className="pv-nav pv-prev focus-ring"
          onClick={(e) => { e.stopPropagation(); onIndexChange(index - 1); }}
          aria-label="Previous photo"
        >
          <ChevronLeft size={28} />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          className="pv-nav pv-next focus-ring"
          onClick={(e) => { e.stopPropagation(); onIndexChange(index + 1); }}
          aria-label="Next photo"
        >
          <ChevronRight size={28} />
        </button>
      )}
      <div className="pv-content" onClick={(e) => e.stopPropagation()}>
        {url && <img src={url} alt={photo.caption || 'Photo evidence'} className="pv-image" />}
        <div className="pv-info">
          {photo.caption && <p className="pv-caption">{photo.caption}</p>}
          {photo.note && <p className="pv-note">{photo.note}</p>}
          <p className="pv-date">Recorded {formatDate(photo.dateTaken)}</p>
          <p className="pv-count">{index + 1} of {photos.length}</p>
        </div>
      </div>
    </div>
  );
}
