import type { ProjectData } from '../types';
import { createDefaultRooms, uid } from './utils';

export const demoProject: ProjectData = {
  id: 'demo-' + uid(),
  nickname: 'Flat 4B — Elm Street',
  address: '12 Elm Street, Manchester, M1 5AB',
  moveOutDate: '2026-11-30',
  tenancyNotes: 'Two-year tenancy ending. Original inventory dated 1 Dec 2024 noted minor scuffs in hallway.',
  isDemo: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  rooms: (() => {
    const rooms = createDefaultRooms();
    // Entrance and hallway
    const hallway = rooms[0];
    hallway.items[0].status = 'good';
    hallway.items[0].note = 'Walls clean, no new marks.';
    hallway.items[1].status = 'attention';
    hallway.items[1].note = 'Carpet has a small frayed edge near the door threshold.';
    hallway.items[2].status = 'good';
    hallway.items[3].status = 'good';
    hallway.items[4].status = 'good';
    hallway.items[5].status = 'damage';
    hallway.items[5].note = 'Pre-existing scuff on skirting board noted in original inventory.';

    // Living room
    const living = rooms[1];
    living.items[0].status = 'good';
    living.items[1].status = 'good';
    living.items[1].note = 'Laminate flooring in good condition.';
    living.items[2].status = 'attention';
    living.items[2].note = 'Window handle slightly stiff.';
    living.items[3].status = 'good';
    living.items[4].status = 'good';
    living.items[5].status = 'n/a';

    // Bedroom
    const bedroom = rooms[2];
    bedroom.items[0].status = 'attention';
    bedroom.items[0].note = 'Picture hook holes from previous tenant. Noted in check-in inventory.';
    bedroom.items[1].status = 'good';
    bedroom.items[2].status = 'good';
    bedroom.items[3].status = 'good';
    bedroom.items[4].status = 'good';
    bedroom.items[5].status = 'unchecked';

    // Kitchen
    const kitchen = rooms[3];
    kitchen.items[0].status = 'good';
    kitchen.items[1].status = 'good';
    kitchen.items[2].status = 'n/a';
    kitchen.items[3].status = 'attention';
    kitchen.items[3].note = 'Oven seal showing signs of wear.';
    kitchen.items[4].status = 'good';
    kitchen.items[5].status = 'unchecked';

    // Bathroom
    const bath = rooms[4];
    bath.items[0].status = 'good';
    bath.items[1].status = 'good';
    bath.items[2].status = 'good';
    bath.items[3].status = 'attention';
    bath.items[3].note = 'Shower screen sealant discolouring.';
    bath.items[4].status = 'good';
    bath.items[5].status = 'unchecked';

    // Communal
    const communal = rooms[5];
    communal.items[0].status = 'good';
    communal.items[1].status = 'good';
    communal.items[2].status = 'unchecked';
    communal.items[3].status = 'unchecked';
    communal.items[4].status = 'unchecked';
    communal.items[5].status = 'unchecked';

    return rooms;
  })(),
  deductions: [
    {
      id: uid(),
      description: 'Carpet replacement — hallway',
      amountPence: 18000,
      landlordExplanation: 'Full carpet replacement due to damage beyond wear and tear.',
      userResponse: 'Carpet had a pre-existing frayed edge noted in check-in inventory. Replacement appears excessive.',
      linkedNotes: 'See hallway flooring item and original inventory photo.',
      status: 'disputed',
      createdAt: Date.now(),
    },
    {
      id: uid(),
      description: 'Oven deep clean',
      amountPence: 6500,
      landlordExplanation: 'Professional cleaning required as oven not left in clean condition.',
      userResponse: '',
      linkedNotes: '',
      status: 'awaiting',
      createdAt: Date.now(),
    },
    {
      id: uid(),
      description: 'Wall repainting — bedroom',
      amountPence: 12000,
      landlordExplanation: 'Repainting required due to picture hook holes.',
      userResponse: 'Holes were present at check-in. Original inventory references them.',
      linkedNotes: 'See bedroom walls item.',
      status: 'to_review',
      createdAt: Date.now(),
    },
  ],
};
