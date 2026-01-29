import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Painel } from './screens/painel/painel';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Clientes } from './screens/clientes/clientes';
import { Servicos } from './screens/servicos/servicos';
import { Usuarios } from './screens/usuarios/usuarios';
import { Conta } from './screens/conta/conta';
import { Agenda } from './screens/agenda/agenda';
import { ToastContainer } from 'react-toastify';
import { Cliente } from './screens/cliente/cliente';
import { Home } from './screens/home/home';
import { Relatorios } from './screens/relatorios/relatorios';

function App() {
  return (
    <BrowserRouter>
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
