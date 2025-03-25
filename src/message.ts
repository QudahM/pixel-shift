/** Message from Devvit to the web view. */
export type DevvitMessage =
  | { type: 'initData'; data: { username: string } }
  | { type: 'updateLeaderboard'; data: { topScores: { username: string; moves: number }[] } };

/** Message from the web view to Devvit. */
export type WebViewMessage =
  | { type: 'webViewReady' }
  | { type: 'submitScore'; data: { moves: number } };

/**
 * Web view MessageEvent listener data type. The Devvit API wraps all messages
 * from Blocks to the web view.
 */
export type DevvitSystemMessage = {
  data: { message: DevvitMessage };
  type?: 'devvit-message' | string;
};
