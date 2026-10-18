// Stub for the registry's discussion kit (user and discussion data for comments/suggestions; UI not benchmarked).
import { createPlatePlugin } from 'platejs/react';
export const discussionPlugin = createPlatePlugin({
  key: 'discussion',
  options: { currentUserId: 'u1', discussions: [], users: { u1: { id: 'u1', name: 'Bench user', avatarUrl: '' }, aiBot: { id: 'aiBot', name: 'AI', avatarUrl: '' } } },
}).extendSelectors(({ getOption }) => ({ currentUser: () => getOption('users')[getOption('currentUserId')], user: (id: string) => getOption('users')[id] }));
export const getDiscussionClickTarget = (_: any) => null;
export const getDiscussionBlockClickTarget = (_: any) => null;
export const DiscussionKit = [discussionPlugin];
