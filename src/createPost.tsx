import { Devvit } from '@devvit/public-api';

Devvit.addMenuItem({
  label: 'Create Daily Pixel Puzzle Post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    const post = await reddit.submitPost({
      title: '🧠 Pixel Shift Daily Puzzle – Can You Solve It Today?',
      subredditName: subreddit.name,
      preview: (
        <vstack padding="medium" gap="medium" alignment="middle center">
          <text size="xlarge" weight="bold" color="brand">
            🎯 Today’s Puzzle is Live!
          </text>
          <text size="medium" alignment="center">
            Rearrange the colored tiles to match the target pattern in the fewest moves.
          </text>
          <hstack gap="small" alignment="center middle">
            <text size="small" color="muted">🏁 Fastest Time Wins</text>
            <text size="small" color="muted">🔄 New Grid Every Day</text>
          </hstack>
          <text size="xsmall" color="muted">
            Click "Start Puzzle" below to begin ⬇️
          </text>
        </vstack>
      ),
    });

    ui.showToast({ text: '🧩 Puzzle post created!' });
    ui.navigateTo(post);
  },
});
