import './createPost.js';
import { Devvit, useState, useWebView } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage } from './message.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

type ScoreEntry = {
  username: string;
  moves: number;
};

Devvit.addCustomPostType({
  name: 'Pixel Shift Puzzle',
  height: 'tall',
  render: (context) => {
    const [username] = useState(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: 'page.html',

      async onMessage(message, webView) {
        if (message.type === 'webViewReady') {
          const postKey = `scores_${context.postId}`;
          const raw = await context.redis.get(postKey);
          const topScores: ScoreEntry[] = raw ? JSON.parse(raw) : [];

          webView.postMessage({
            type: 'initData',
            data: { username },
          });

          webView.postMessage({
            type: 'updateLeaderboard',
            data: { topScores },
          });
        }

        if (message.type === 'submitScore') {
          const username = (await context.reddit.getCurrentUsername()) ?? 'anon';
          const postKey = `scores_${context.postId}`;
          const raw = await context.redis.get(postKey);
          let scores: ScoreEntry[] = raw ? JSON.parse(raw) : [];

          const existing = scores.find((s) => s.username === username);
          if (!existing || message.data.moves < existing.moves) {
            scores = scores.filter((s) => s.username !== username);
            scores.push({ username, moves: message.data.moves });
          }

          scores.sort((a, b) => a.moves - b.moves);
          const topScores: ScoreEntry[] = scores.slice(0, 5);
          await context.redis.set(postKey, JSON.stringify(topScores));

          webView.postMessage({
            type: 'updateLeaderboard',
            data: { topScores },
          });
        }
      },
    });

    return (
      <vstack grow padding="small">
        <vstack grow alignment="middle center">
          <text size="xlarge" weight="bold">Pixel Shift Daily Puzzle</text>
          <spacer />
          <text size="medium">Username: {username}</text>
          <spacer />
          <button onPress={() => webView.mount()}>Start Puzzle</button>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
