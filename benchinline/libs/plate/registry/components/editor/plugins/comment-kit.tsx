// Stub for the registry's comment kit: the plugin without its comment UI (comments aren't benchmarked).
import { BaseCommentPlugin } from '@platejs/comment';
import { toTPlatePlugin } from 'platejs/react';
export const commentPlugin = toTPlatePlugin(BaseCommentPlugin);
export const CommentKit = [commentPlugin];
