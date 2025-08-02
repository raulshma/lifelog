import React from 'react';
import {
  Text,
  Card,
  CardHeader,
  makeStyles,
  tokens,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  placeholderCard: {
    padding: tokens.spacingHorizontalL,
    textAlign: 'center',
  },
});

export const KnowledgeBase: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Text size={800} weight='bold'>
        Knowledge Base
      </Text>

      <Card className={styles.placeholderCard}>
        <CardHeader
          header={<Text size={600}>Coming Soon</Text>}
          description={
            <Text>
              The Knowledge Base module will help you organize and search your
              personal knowledge. Features will include note-taking, tagging,
              search, and knowledge graphs.
            </Text>
          }
        />
      </Card>
    </div>
  );
};
