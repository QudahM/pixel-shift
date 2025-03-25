import { Devvit } from '@devvit/public-api';

Devvit.addMenuItem({
  label: 'Create Daily Pixel Puzzle Post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    const post = await reddit.submitPost({
      title: '🧩 Pixel Shift Daily Puzzle – Can You Beat Today’s Challenge?',
      subredditName: subreddit.name,
      preview: (
        <vstack alignment="middle center" padding="medium" gap="small">
          <text size="large" weight="bold">🎯 Your Daily Pattern Awaits</text>
          <text size="small">Rearrange the tiles to match today’s color grid. Compete for the fastest solve!</text>
          <text size="xsmall" color="muted">Click "Start Puzzle" to begin</text>
        </vstack>
      ),
    });

    ui.showToast({ text: '🧩 Puzzle post created!' });
    ui.navigateTo(post);
  },
});
