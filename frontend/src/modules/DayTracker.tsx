import React from 'react';
import { Text, Card, CardHeader, makeStyles, tokens } from '@fluentui/react-components';

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

export const DayTracker: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Text size={800} weight="bold">Day Tracker</Text>
      
      <Card className={styles.placeholderCard}>
        <CardHeader
          header={<Text size={600}>Coming Soon</Text>}
          description={
            <Text>
              The Day Tracker module will help you track your daily activities, habits, and goals.
              Features will include habit tracking, daily journaling, and progress visualization.
            </Text>
          }
        />
      </Card>
    </div>
  );
};