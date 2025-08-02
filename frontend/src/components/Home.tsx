import React from 'react';
import { Text, Card, CardHeader, CardPreview, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  welcomeCard: {
    maxWidth: '600px',
  },
  modulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  moduleCard: {
    height: '120px',
  },
});

export const Home: React.FC = () => {
  const styles = useStyles();

  const modules = [
    {
      name: 'Day Tracker',
      description: 'Track your daily activities, habits, and goals',
      status: 'Coming Soon',
    },
    {
      name: 'Knowledge Base',
      description: 'Organize and search your personal knowledge',
      status: 'Coming Soon',
    },
    {
      name: 'Vault',
      description: 'Secure storage for sensitive information',
      status: 'Coming Soon',
    },
    {
      name: 'Document Hub',
      description: 'Centralized document management and organization',
      status: 'Coming Soon',
    },
    {
      name: 'Inventory',
      description: 'Track your possessions and their locations',
      status: 'Coming Soon',
    },
  ];

  return (
    <div className={styles.container}>
      <Card className={styles.welcomeCard}>
        <CardHeader
          header={<Text size={800} weight="bold">Welcome to LifeLog</Text>}
          description={
            <Text>
              Your comprehensive life organization application. Get started by exploring the modules below.
            </Text>
          }
        />
      </Card>

      <div>
        <Text size={600} weight="semibold" style={{ marginBottom: tokens.spacingVerticalM }}>
          Available Modules
        </Text>
        
        <div className={styles.modulesGrid}>
          {modules.map((module) => (
            <Card key={module.name} className={styles.moduleCard}>
              <CardHeader
                header={<Text weight="semibold">{module.name}</Text>}
                description={<Text size={200}>{module.description}</Text>}
              />
              <CardPreview>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                  {module.status}
                </Text>
              </CardPreview>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};