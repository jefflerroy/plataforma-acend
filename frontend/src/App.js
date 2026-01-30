import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from './screens/home/home';
import { MenuLateral } from './components/menuLateral/menuLateral';

function App() {
  return (
    <BrowserRouter>
    <MenuLateral />
      <div className="App">
        <Routes>
          <Route path='/' exact element={<Home />} />
          <Route path='*' element={
            <Navigate to='/' />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
