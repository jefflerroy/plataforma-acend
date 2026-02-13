import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Inicio } from './screens/inicio/inicio';
import { MenuLateral } from './components/menuLateral/menuLateral';
import { MinhaDieta } from './screens/minha-dieta/minha-dieta';
import { MetodoAscend } from './screens/metodo-ascend/metodo-ascend';
import { Comunidade } from './screens/comunidade/comunidade';
import { MinhaAgenda } from './screens/minha-agenda/minha-agenda';
import { Evolucao } from './screens/evolucao/evolucao';
import { DuvidasIa } from './screens/duvidas-ia/duvidas-ia';
import { Login } from './screens/login/login';
import { Exames } from './screens/exames/exames';
import { Pacientes } from './screens/pacientes/pacientes';

function LayoutComMenu() {
  return (
    <>
      <MenuLateral />
      <div className="App">
        <Outlet />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<LayoutComMenu />}>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/minha-dieta" element={<MinhaDieta />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/exames" element={<Exames />} />
          <Route path="/metodo-ascend" element={<MetodoAscend />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/minha-agenda" element={<MinhaAgenda />} />
          <Route path="/evolucao" element={<Evolucao />} />
          <Route path="/duvidas-ia" element={<DuvidasIa />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
