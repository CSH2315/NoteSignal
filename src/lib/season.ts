import { isWithinInterval } from 'date-fns';

// 2026 Season 1 (Example Dates)
const SEASON_START = new Date('2026-03-01T00:00:00+09:00');
const SEASON_END = new Date('2026-04-03T23:59:59+09:00');

export const isSeasonActive = () => {
  const now = new Date();
  
  // For emergency manual override, uncomment below
  // return true; 

  return isWithinInterval(now, {
    start: SEASON_START,
    end: SEASON_END,
  });
};
