import "./pacientes.css";
import { Header } from "../../components/header/header";
import { MdFileDownload, MdFileUpload } from "react-icons/md";
import { Select } from "../../components/select/select";

export function Pacientes() {

  return (
    <>
      <Header nome="Pacientes" />
      <div className="pacientes">
        <div className="lista">
          <input
            placeholder="Pesquisar"
          />
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Fulano</td>
                <td>11/02/2026</td>
                <td><MdFileDownload className="icon" /></td>
              </tr>              
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
