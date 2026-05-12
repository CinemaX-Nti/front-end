export type SeatState = 'available' | 'selected' | 'booked';

export interface Seat {
  id: string; // e.g. J12
  row: string; // e.g. J
  number: number; // e.g. 12
  state: SeatState;
}

export interface SeatsLayoutConfig {
  rows: string[]; // e.g. ['A','B',...]
  seatsPerRow: number[]; // same length as rows
  // aisle columns are represented as “missing” indices in each row.
  // index refers to the 1-based seat number within the row.
  aisleAfterSeatNumbers?: number[]; // for simplicity, applied to all rows
}

