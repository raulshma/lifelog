import React from 'react';
import './App.css';

interface AppProps {
  children?: React.ReactNode;
}

function App({ children }: AppProps) {
  return (
    <div className="app">
      <header className="app-header">
        <h1>LifeLog</h1>
        <p>Your comprehensive life organization application</p>
      </header>
      
      <main className="app-main">
        {children || (
          <div className="welcome-message">
            <h2>Welcome to LifeLog</h2>
            <p>Project setup complete! Ready for module development.</p>
            <div className="modules-preview">
              <h3>Planned Modules:</h3>
              <ul>
                <li>Day Tracker</li>
                <li>Knowledge Base</li>
                <li>Vault</li>
                <li>Document Hub</li>
                <li>Inventory</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
