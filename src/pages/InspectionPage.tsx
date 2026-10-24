import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Camera, ChevronRight, Chrome as Home, X, CreditCard as Edit2, Check, Image as ImageIcon } from 'lucide-react';
import { useProject } from '../lib/projectContext';
import { countRoomItems, compressImage, uid, blobToObjectURL, formatDate } from '../lib/utils';
import type { ItemStatus, PhotoRecord } from '../types';
import { STATUS_LABELS, STATUS_BADGES } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import PhotoViewer from '../components/PhotoViewer';
import './InspectionPage.css';

const STATUS_ORDER: ItemStatus[] = ['unchecked', 'good', 'attention', 'damage', 'n/a'];

const STATUS_COLORS: Record<ItemStatus, string> = {
  good: 'var(--success-500)',
  attention: 'var(--warn-500)',
  damage: 'var(--error-500)',
  'n/a': 'var(--ink-400)',
  unchecked: 'var(--ink-300)',
};

export default function InspectionPage() {
  const { projectId: roomIdParam } = useParams();
  const navigate = useNavigate();
  const { project, addRoom, renameRoom, deleteRoom, addItem, updateItem, deleteItem, addPhoto, updatePhoto, deletePhoto, photos } = useProject();

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [addItemRoomId, setAddItemRoomId] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<{ roomId: string; itemId: string } | null>(null);
  const [photoViewerItem, setPhotoViewerItem] = useState<{ roomId: string; itemId: string } | null>(null);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  if (!project) return null;

  const rooms = project.rooms;
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Set active room from URL param
  useEffect(() => {
    if (roomIdParam) {
      const room = rooms.find((r) => r.id === roomIdParam);
      if (room) setActiveRoomId(room.id);
    } else if (rooms.length > 0 && !activeRoomId) {
      setActiveRoomId(rooms[0].id);
    }
  }, [roomIdParam, rooms]);

  // Scroll to room when changed
  useEffect(() => {
    if (activeRoomId && window.innerWidth >= 860) {
      const el = document.getElementById(`room-${activeRoomId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeRoomId]);

  function handleAddRoom() {
    if (!newRoomName.trim()) return;
    addRoom(newRoomName.trim());
    setNewRoomName('');
    setAddRoomOpen(false);
  }

  function handleRenameRoom() {
    if (!editingRoomId || !editRoomName.trim()) return;
    renameRoom(editingRoomId, editRoomName.trim());
    setEditingRoomId(null);
  }

  function handleAddItem() {
    if (!addItemRoomId || !newItemLabel.trim()) return;
    addItem(addItemRoomId, newItemLabel.trim());
    setNewItemLabel('');
    setAddItemRoomId(null);
  }

  async function handlePhotoSelect(roomId: string, itemId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setPhotoError(null);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setPhotoError('Please select an image file.');
          continue;
        }
        if (file.size > 15 * 1024 * 1024) {
          setPhotoError('Image is too large (max 15MB).');
          continue;
        }
        const { blob, dateTaken } = await compressImage(file);
        const photo: PhotoRecord = {
          id: uid(),
          roomId,
          itemId,
          blob,
          mimeType: blob.type || 'image/jpeg',
          caption: '',
          note: '',
          dateTaken,
          createdAt: Date.now(),
        };
        await addPhoto(photo);
        updateItem(roomId, itemId, {
          photoIds: [...(activeRoom?.items.find((i) => i.id === itemId)?.photoIds || []), photo.id],
        });
      }
    } catch {
      setPhotoError('Could not process this image. Try a different file.');
    }
  }

  function getItemPhotos(itemId: string): PhotoRecord[] {
    const item = activeRoom?.items.find((i) => i.id === itemId);
    if (!item) return [];
    const result: PhotoRecord[] = [];
    for (const pid of item.photoIds) {
      const p = photos.get(pid);
      if (p) result.push(p);
    }
    return result;
  }

  return (
    <div className="inspection">
      <div className="inspection-header">
        <h1 className="display-lg">Inspection</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setAddRoomOpen(true)}>
          <Plus size={16} />
          Add room
        </button>
      </div>

      {rooms.length === 0 && (
        <div className="empty-state card">
          <Home size={32} />
          <h2 className="display-sm">No rooms yet</h2>
          <p className="text-body">Add a room to start your inspection.</p>
          <button className="btn btn-primary" onClick={() => setAddRoomOpen(true)}>
            <Plus size={16} />
            Add your first room
          </button>
        </div>
      )}

      <div className="inspection-layout">
        {/* Room sidebar */}
        {rooms.length > 0 && (
          <div className="inspection-rooms-list">
            {rooms.map((room) => {
              const r = countRoomItems(room);
              const pct = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
              return (
                <button
                  key={room.id}
                  className={`inspection-room-tab ${activeRoomId === room.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveRoomId(room.id);
                    navigate(`/app/inspection/${room.id}`, { replace: true });
                  }}
                >
                  <span className="inspection-room-tab-name">{room.name}</span>
                  <span className="inspection-room-tab-count">{r.completed}/{r.total}</span>
                  <div className="inspection-room-tab-bar">
                    <div className="inspection-room-tab-fill" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Active room content */}
        {activeRoom && (
          <div className="inspection-room-content" id={`room-${activeRoom.id}`}>
            <div className="inspection-room-header">
              <div className="inspection-room-title-area">
                {editingRoomId === activeRoom.id ? (
                  <div className="inspection-room-edit">
                    <input
                      className="input"
                      value={editRoomName}
                      onChange={(e) => setEditRoomName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameRoom()}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleRenameRoom}>
                      <Check size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingRoomId(null)}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <h2 className="display-md">{activeRoom.name}</h2>
                )}
              </div>
              <div className="inspection-room-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setEditingRoomId(activeRoom.id); setEditRoomName(activeRoom.name); }}
                >
                  <Edit2 size={14} />
                  Rename
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-danger-text"
                  onClick={() => setConfirmDeleteRoom(activeRoom.id)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>

            {activeRoom.items.length === 0 && (
              <div className="empty-state-sm card">
                <p className="text-body">No checklist items yet. Add one to start documenting this room.</p>
              </div>
            )}

            {/* Checklist items */}
            <div className="inspection-items">
              {activeRoom.items.map((item) => {
                const isExpanded = expandedItem === item.id;
                const itemPhotos = getItemPhotos(item.id);
                return (
                  <div key={item.id} className={`inspection-item card ${isExpanded ? 'expanded' : ''}`}>
                    <div className="inspection-item-header">
                      <button
                        className="inspection-item-toggle"
                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                        aria-expanded={isExpanded}
                      >
                        <span
                          className="inspection-item-dot"
                          style={{ background: STATUS_COLORS[item.status] }}
                        />
                        <span className="inspection-item-label">{item.label}</span>
                        {item.custom && <span className="badge badge-neutral">Custom</span>}
                      </button>
                      <span className={`badge ${STATUS_BADGES[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="inspection-item-body">
                        {/* Status selector */}
                        <div className="inspection-status-row">
                          <label className="label">Status</label>
                          <div className="status-pills">
                            {STATUS_ORDER.map((status) => (
                              <button
                                key={status}
                                className={`status-pill ${item.status === status ? 'active' : ''}`}
                                style={item.status === status ? { borderColor: STATUS_COLORS[status], color: STATUS_COLORS[status], background: `${STATUS_COLORS[status]}15` } : {}}
                                onClick={() => updateItem(activeRoom.id, item.id, { status })}
                              >
                                <span className="status-pill-dot" style={{ background: STATUS_COLORS[status] }} />
                                {STATUS_LABELS[status]}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Note */}
                        <div className="field-group">
                          <label className="label">Note</label>
                          <textarea
                            className="textarea"
                            placeholder="Add a condition note for this item…"
                            value={item.note}
                            onChange={(e) => updateItem(activeRoom.id, item.id, { note: e.target.value })}
                            maxLength={500}
                          />
                        </div>

                        {/* Photos */}
                        <div className="inspection-photos-section">
                          <div className="inspection-photos-header">
                            <label className="label">
                              <Camera size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                              Photos ({itemPhotos.length})
                            </label>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => fileInputRefs.current.get(`${activeRoom.id}-${item.id}`)?.click()}
                            >
                              <Plus size={14} />
                              Add photo
                            </button>
                            <input
                              ref={(el) => { fileInputRefs.current.set(`${activeRoom.id}-${item.id}`, el); }}
                              type="file"
                              accept="image/*"
                              multiple
                              capture="environment"
                              style={{ display: 'none' }}
                              onChange={(e) => handlePhotoSelect(activeRoom.id, item.id, e.target.files)}
                            />
                          </div>

                          {photoError && (
                            <div className="inspection-photo-error">{photoError}</div>
                          )}

                          {itemPhotos.length > 0 && (
                            <div className="inspection-photo-grid">
                              {itemPhotos.map((photo, idx) => (
                                <PhotoThumb
                                  key={photo.id}
                                  photo={photo}
                                  onView={() => { setPhotoViewerItem({ roomId: activeRoom.id, itemId: item.id }); setPhotoViewerIndex(idx); }}
                                  onDelete={async () => {
                                    await deletePhoto(photo.id);
                                  }}
                                  onCaptionChange={(caption) => updatePhoto(photo.id, { caption })}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Delete item */}
                        {item.custom && (
                          <button
                            className="btn btn-ghost btn-sm btn-danger-text"
                            onClick={() => setConfirmDeleteItem({ roomId: activeRoom.id, itemId: item.id })}
                          >
                            <Trash2 size={14} />
                            Remove this item
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add custom item */}
            {addItemRoomId === activeRoom.id ? (
              <div className="inspection-add-item">
                <input
                  className="input"
                  placeholder="Custom checklist item label"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem();
                    if (e.key === 'Escape') setAddItemRoomId(null);
                  }}
                />
                <button className="btn btn-primary btn-sm" onClick={handleAddItem}>
                  <Check size={14} />
                  Add
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setAddItemRoomId(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="btn btn-ghost inspection-add-item-btn"
                onClick={() => setAddItemRoomId(activeRoom.id)}
              >
                <Plus size={16} />
                Add custom item
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add room modal */}
      <Modal open={addRoomOpen} onClose={() => setAddRoomOpen(false)} title="Add a room">
        <div className="field-group">
          <label className="label" htmlFor="roomName">Room name</label>
          <input
            id="roomName"
            className="input"
            placeholder="e.g. Garage, Garden, Loft"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setAddRoomOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddRoom}>
            <Plus size={16} />
            Add room
          </button>
        </div>
      </Modal>

      {/* Delete room confirmation */}
      <ConfirmDialog
        open={confirmDeleteRoom !== null}
        title="Delete room?"
        message="This will remove the room, all its checklist items and any attached photos. This cannot be undone."
        confirmLabel="Delete room"
        destructive
        onConfirm={() => {
          if (confirmDeleteRoom) {
            deleteRoom(confirmDeleteRoom);
            const remaining = rooms.filter((r) => r.id !== confirmDeleteRoom);
            setActiveRoomId(remaining[0]?.id || null);
            navigate('/app/inspection', { replace: true });
          }
          setConfirmDeleteRoom(null);
        }}
        onCancel={() => setConfirmDeleteRoom(null)}
      />

      {/* Delete item confirmation */}
      <ConfirmDialog
        open={confirmDeleteItem !== null}
        title="Remove item?"
        message="This will remove the checklist item and any attached photos. This cannot be undone."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (confirmDeleteItem) {
            deleteItem(confirmDeleteItem.roomId, confirmDeleteItem.itemId);
          }
          setConfirmDeleteItem(null);
        }}
        onCancel={() => setConfirmDeleteItem(null)}
      />

      {/* Photo viewer */}
      {photoViewerItem && activeRoom && (
        <PhotoViewer
          photos={getItemPhotos(photoViewerItem.itemId)}
          index={photoViewerIndex}
          onClose={() => setPhotoViewerItem(null)}
          onIndexChange={setPhotoViewerIndex}
        />
      )}
    </div>
  );
}

function PhotoThumb({
  photo,
  onView,
  onDelete,
  onCaptionChange,
}: {
  photo: PhotoRecord;
  onView: () => void;
  onDelete: () => void;
  onCaptionChange: (caption: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [editingCaption, setEditingCaption] = useState(false);
  const [caption, setCaption] = useState(photo.caption);

  useEffect(() => {
    const u = blobToObjectURL(photo.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [photo.blob]);

  useEffect(() => {
    setCaption(photo.caption);
  }, [photo.caption]);

  return (
    <div className="photo-thumb">
      <div className="photo-thumb-img" onClick={onView}>
        {url && <img src={url} alt={photo.caption || 'Photo evidence'} />}
        <div className="photo-thumb-overlay">
          <ImageIcon size={16} />
          <span>View</span>
        </div>
      </div>
      <div className="photo-thumb-info">
        {editingCaption ? (
          <div className="photo-thumb-caption-edit">
            <input
              className="input input-sm"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption…"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onCaptionChange(caption); setEditingCaption(false); }
                if (e.key === 'Escape') { setCaption(photo.caption); setEditingCaption(false); }
              }}
              onBlur={() => { onCaptionChange(caption); setEditingCaption(false); }}
            />
          </div>
        ) : (
          <button className="photo-thumb-caption" onClick={() => setEditingCaption(true)}>
            {photo.caption || 'Add caption…'}
          </button>
        )}
        <span className="photo-thumb-date">{formatDate(photo.dateTaken)}</span>
      </div>
      <button className="photo-thumb-delete" onClick={onDelete} aria-label="Delete photo">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
