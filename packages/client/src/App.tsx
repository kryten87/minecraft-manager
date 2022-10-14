import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Create } from './pages/Create';
import { List } from './pages/List';
import { NavButton } from './components//NavButton';

function App() {
  return (
    <BrowserRouter>
      <div className="container" style={{ marginTop: '2em' }}>
        <div className="grid">
          <div><h1>Minecraft Servers</h1></div>
          <div>
            <NavButton
              labels={[
                { when: '/', label: 'Add New...', path: 'create' },
                { when: '/create', label: 'Cancel', path: '' },
              ]}
              style={{ float: 'right' }}
            />
          </div>
        </div>
        <Routes>
          <Route path="" element={ <List /> }></Route>
          <Route path="create" element={ <Create /> }></Route>
        </Routes>
      </div>`
    </BrowserRouter>
  );
}

export default App;
