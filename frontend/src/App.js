import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Inicio } from './screens/inicio/inicio';
import { MenuLateral } from './components/menuLateral/menuLateral';
import { MinhaDieta } from './screens/minha-dieta/minha-dieta';
import { MetodoAscend } from './screens/metodo-ascend/metodo-ascend';

function App() {
  return (
    <BrowserRouter>
    <MenuLateral />
      <div className="App">
        <Routes>
          <Route path='/' exact element={<Inicio />} />
          <Route path='/inicio' exact element={<Inicio />} />
          <Route path='/minha-dieta' exact element={<MinhaDieta />} />
          <Route path='/metodo-ascend' exact element={<MetodoAscend />} />
          <Route path='*' element={
            <Navigate to='/' />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
