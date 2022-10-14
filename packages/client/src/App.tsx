import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import { Create } from './pages/Create';
import { List } from './pages/List';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">List</Link></li>
            <li><Link to="/create">Create</Link></li>
          </ul>
        </nav>
      </div>

      <Routes>
        <Route path="" element={ <List /> }></Route>
        <Route path="create" element={ <Create /> }></Route>
      </Routes>
    </Router>
  );
}

export default App;
