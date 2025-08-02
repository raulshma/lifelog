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

export const DocumentHub: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Text size={800} weight='bold'>
        Document Hub
      </Text>

      <Card className={styles.placeholderCard}>
        <CardHeader
          header={<Text size={600}>Coming Soon</Text>}
          description={
            <Text>
              The Document Hub module will provide centralized document
              management and organization. Features will include file storage,
              categorization, search, and collaboration tools.
            </Text>
          }
        />
      </Card>
    </div>
  );
};
