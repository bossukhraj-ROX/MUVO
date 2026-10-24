export type ItemStatus = 'good' | 'attention' | 'damage' | 'n/a' | 'unchecked';

export type DeductionStatus = 'to_review' | 'awaiting' | 'disputed' | 'resolved';

export type EmailTemplateId = 'request_explanation' | 'request_evidence' | 'question_deduction' | 'request_update';

export interface PhotoRecord {
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

export interface ChecklistItem {
  id: string;
  label: string;
  status: ItemStatus;
  note: string;
  photoIds: string[];
  custom: boolean;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
  custom: boolean;
}

export interface Deduction {
  id: string;
  description: string;
  amountPence: number;
  landlordExplanation: string;
  userResponse: string;
  linkedNotes: string;
  status: DeductionStatus;
  createdAt: number;
}

export interface ProjectData {
  id: string;
  nickname: string;
  address: string;
  moveOutDate: string;
  tenancyNotes: string;
  rooms: Room[];
  deductions: Deduction[];
  createdAt: number;
  updatedAt: number;
  isDemo: boolean;
}

export const STATUS_LABELS: Record<ItemStatus, string> = {
  good: 'Good condition',
  attention: 'Needs attention',
  damage: 'Pre-existing damage',
  'n/a': 'Not applicable',
  unchecked: 'Not yet checked',
};

export const STATUS_BADGES: Record<ItemStatus, string> = {
  good: 'badge-good',
  attention: 'badge-warn',
  damage: 'badge-error',
  'n/a': 'badge-neutral',
  unchecked: 'badge-neutral',
};

export const DEDUCTION_LABELS: Record<DeductionStatus, string> = {
  to_review: 'To review',
  awaiting: 'Awaiting explanation',
  disputed: 'Disputed',
  resolved: 'Resolved',
};

export const DEDUCTION_BADGES: Record<DeductionStatus, string> = {
  to_review: 'badge-neutral',
  awaiting: 'badge-warn',
  disputed: 'badge-error',
  resolved: 'badge-good',
};

export const DEFAULT_ROOM_DEFS = [
  { name: 'Entrance and hallway', icon: 'door' },
  { name: 'Living room', icon: 'sofa' },
  { name: 'Bedroom', icon: 'bed' },
  { name: 'Kitchen', icon: 'kitchen' },
  { name: 'Bathroom', icon: 'bath' },
  { name: 'Communal areas', icon: 'users' },
  { name: 'Other areas', icon: 'map' },
] as const;

export const DEFAULT_CHECKLIST_ITEMS = [
  'Walls and paintwork',
  'Flooring and carpets',
  'Windows and frames',
  'Fixtures and fittings',
  'Cleanliness',
  'Visible damage',
] as const;
