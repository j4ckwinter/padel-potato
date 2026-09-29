import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from 'react';

import {
  decrementGamePlayers,
  incrementGamePlayers,
  initialGameDraft,
  selectGameDay,
  selectGameTime,
  type GameDraft,
  updateGameDuration,
  updateGameFormat,
  updateGameVenue,
} from './gameDraft';

type GameDraftAction =
  | Readonly<{ type: 'draftReset' }>
  | Readonly<{ type: 'playersDecremented' }>
  | Readonly<{ type: 'playersIncremented' }>
  | Readonly<{ date: string; type: 'daySelected' }>
  | Readonly<{
      durationMinutes: GameDraft['setup']['durationMinutes'];
      type: 'durationChanged';
    }>
  | Readonly<{
      format: GameDraft['setup']['format'];
      type: 'formatChanged';
    }>
  | Readonly<{ time: string; type: 'timeSelected' }>
  | Readonly<{ type: 'venueChanged'; venueQuery: string }>;

type GameDraftContextValue = Readonly<{
  draft: GameDraft;
  decrementPlayers: () => void;
  incrementPlayers: () => void;
  resetDraft: () => void;
  selectDay: (date: string) => void;
  selectDuration: (
    durationMinutes: GameDraft['setup']['durationMinutes'],
  ) => void;
  selectFormat: (format: GameDraft['setup']['format']) => void;
  selectTime: (time: string) => void;
  setVenueQuery: (venueQuery: string) => void;
}>;

const GameDraftContext = createContext<GameDraftContextValue | null>(null);

function gameDraftReducer(draft: GameDraft, action: GameDraftAction) {
  switch (action.type) {
    case 'draftReset':
      return initialGameDraft;
    case 'playersDecremented':
      return decrementGamePlayers(draft);
    case 'playersIncremented':
      return incrementGamePlayers(draft);
    case 'daySelected':
      return selectGameDay(draft, action.date);
    case 'durationChanged':
      return updateGameDuration(draft, action.durationMinutes);
    case 'formatChanged':
      return updateGameFormat(draft, action.format);
    case 'timeSelected':
      return selectGameTime(draft, action.time);
    case 'venueChanged':
      return updateGameVenue(draft, action.venueQuery);
  }
}

export function GameDraftProvider({ children }: PropsWithChildren) {
  const [draft, dispatch] = useReducer(gameDraftReducer, initialGameDraft);
  const value = useMemo<GameDraftContextValue>(
    () => ({
      decrementPlayers: () => dispatch({ type: 'playersDecremented' }),
      draft,
      incrementPlayers: () => dispatch({ type: 'playersIncremented' }),
      resetDraft: () => dispatch({ type: 'draftReset' }),
      selectDay: (date) => dispatch({ date, type: 'daySelected' }),
      selectDuration: (durationMinutes) =>
        dispatch({ durationMinutes, type: 'durationChanged' }),
      selectFormat: (format) => dispatch({ format, type: 'formatChanged' }),
      selectTime: (time) => dispatch({ time, type: 'timeSelected' }),
      setVenueQuery: (venueQuery) =>
        dispatch({ type: 'venueChanged', venueQuery }),
    }),
    [draft],
  );

  return (
    <GameDraftContext.Provider value={value}>
      {children}
    </GameDraftContext.Provider>
  );
}

export function useGameDraft() {
  const value = useContext(GameDraftContext);
  if (!value) {
    throw new Error('useGameDraft must be used inside GameDraftProvider.');
  }

  return value;
}
