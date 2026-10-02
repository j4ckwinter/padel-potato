import { expect, it } from '@jest/globals';
import { createDemoGameRepository } from '../src/features/demo/demoGameRepository';
import {
  initialGameDraft,
  selectGameDay,
  selectGameTime,
  updateGameVenue,
} from '../src/features/game-creation/gameDraft';
const organiser = {
  id: 'management-organiser',
  initials: 'MO',
  name: 'Organiser',
  rating: '3.0',
};
const player = {
  id: 'management-player',
  initials: 'MP',
  name: 'Player',
  rating: '3.0',
};
const third = {
  id: 'management-third',
  initials: 'MT',
  name: 'Third',
  rating: '3.0',
};
const draft = updateGameVenue(
  selectGameTime(selectGameDay(initialGameDraft, '2099-10-07'), '18:30'),
  'Club',
);
const nextSchedule = selectGameTime(
  selectGameDay(initialGameDraft, '2099-10-08'),
  '19:00',
).schedule;

it('leaves a joined game, keeps other players ordered, and retries idempotently', async () => {
  const owner = createDemoGameRepository(organiser);
  const guest = createDemoGameRepository(player);
  const game = await owner.create(draft);
  await guest.join(game.id);
  await createDemoGameRepository(third).join(game.id);
  const result = await guest.leave(game.id);
  expect(result.status).toBe('left');
  expect(await owner.findById(game.id)).toMatchObject({
    participants: [
      { player: { id: organiser.id } },
      { player: { id: third.id } },
    ],
  });
  expect((await guest.leave(game.id)).status).toBe('alreadyLeft');
  expect((await owner.leave(game.id)).status).toBe('organiser');
});
it('reschedules only before others join and refuses non-organisers', async () => {
  if (nextSchedule.status !== 'complete') throw new Error('Invalid fixture');
  const owner = createDemoGameRepository(organiser);
  const guest = createDemoGameRepository(player);
  const game = await owner.create(draft);
  expect((await guest.reschedule(game.id, nextSchedule)).status).toBe(
    'forbidden',
  );
  expect((await owner.reschedule(game.id, nextSchedule)).status).toBe(
    'rescheduled',
  );
  expect((await owner.findById(game.id))?.schedule).toEqual(nextSchedule);
  await guest.join(game.id);
  expect(
    (await owner.reschedule(game.id, draft.schedule as typeof nextSchedule))
      .status,
  ).toBe('playersJoined');
});
it('refuses departures and rescheduling after cancellation', async () => {
  if (nextSchedule.status !== 'complete') throw new Error('Invalid fixture');
  const owner = createDemoGameRepository(organiser);
  const guest = createDemoGameRepository(player);
  const game = await owner.create(draft);
  await guest.join(game.id);
  await owner.transitionLifecycle(game.id, {
    type: 'cancel',
    at: new Date().toISOString(),
  });
  expect((await guest.leave(game.id)).status).toBe('unavailable');
  expect((await owner.reschedule(game.id, nextSchedule)).status).toBe(
    'unavailable',
  );
});
