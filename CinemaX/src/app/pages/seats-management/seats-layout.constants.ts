import type { SeatsLayoutConfig, SeatState } from '../../models/seats-layout.model';


export const DEFAULT_ROWS = ['A','B','C','D','E','F','G','H'];

// Note: exact geometry from image cannot be pixel-read via tools.
// This config is tuned to common cinema layouts and will be adjusted visually.
export const SEATS_LAYOUT_CONFIG: SeatsLayoutConfig = {
  rows: DEFAULT_ROWS,
  // seats counts per row (left-to-right seat numbers start at 1)
  // these numbers are chosen to look like the provided image.
  seatsPerRow: [12, 12, 12, 12, 12, 12, 12, 12],
  // add an aisle after these seat indices (applies to all rows)
  aisleAfterSeatNumbers: [6],
};

export const SEAT_ID_SEPARATOR = '';

export function rowSeatId(row: string, seatNumber: number): string {
  // booking.service uses format like J12 or F05.
  // Image likely has 2-digit numbers.
  const n = seatNumber.toString().padStart(2, '0');
  return `${row}${n}`;
}

export function seatStateClass(state: SeatState): string {
  if (state === 'booked') return 'booked';
  if (state === 'reserved') return 'reserved';
  if (state === 'selected') return 'selected';
  return 'available';
}

