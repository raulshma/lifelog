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

export const Inventory: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Text size={800} weight='bold'>
        Inventory
      </Text>

      <Card className={styles.placeholderCard}>
        <CardHeader
          header={<Text size={600}>Coming Soon</Text>}
          description={
            <Text>
              The Inventory module will help you track your possessions and
              their locations. Features will include item cataloging, location
              tracking, and value management.
            </Text>
          }
        />
      </Card>
    </div>
  );
};
