import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
  tokens,
  Text,
  Button,
} from '@fluentui/react-components';
import {
  Home24Regular,
  Calendar24Regular,
  Book24Regular,
  Vault24Regular,
  Document24Regular,
  Archive24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingHorizontalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  nav: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  sidebar: {
    width: '240px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: tokens.spacingVerticalM,
  },
  content: {
    flex: 1,
    padding: tokens.spacingHorizontalL,
    overflow: 'auto',
  },
  navButton: {
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: tokens.spacingVerticalXS,
  },
  activeNavButton: {
    backgroundColor: tokens.colorBrandBackground2,
  },
});

const navigationItems = [
  { path: '/', label: 'Home', icon: Home24Regular },
  { path: '/day-tracker', label: 'Day Tracker', icon: Calendar24Regular },
  { path: '/knowledge-base', label: 'Knowledge Base', icon: Book24Regular },
  { path: '/vault', label: 'Vault', icon: Vault24Regular },
  { path: '/document-hub', label: 'Document Hub', icon: Document24Regular },
  { path: '/inventory', label: 'Inventory', icon: Archive24Regular },
];

export const Layout: React.FC = () => {
  const styles = useStyles();
  const location = useLocation();

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.root}>
        <header className={styles.header}>
          <Text size={600} weight="semibold">
            LifeLog
          </Text>
          <nav className={styles.nav}>
            {/* Future: User menu, settings, etc. */}
          </nav>
        </header>
        
        <main className={styles.main}>
          <aside className={styles.sidebar}>
            <nav>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                    <Button
                      appearance="subtle"
                      icon={<Icon />}
                      className={`${styles.navButton} ${isActive ? styles.activeNavButton : ''}`}
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </aside>
          
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>
    </FluentProvider>
  );
};