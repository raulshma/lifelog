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

export const Vault: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Text size={800} weight='bold'>
        Vault
      </Text>

      <Card className={styles.placeholderCard}>
        <CardHeader
          header={<Text size={600}>Coming Soon</Text>}
          description={
            <Text>
              The Vault module will provide secure storage for sensitive
              information. Features will include encrypted storage, secure
              sharing, and access controls.
            </Text>
          }
        />
      </Card>
    </div>
  );
};
