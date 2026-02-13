import "./exames.css";
import { Header } from "../../components/header/header";
import { MdFileDownload, MdFileUpload  } from "react-icons/md";
import { Select } from "../../components/select/select";

export function Exames() { 
  
  return (
    <>
      <Header nome="Exames" />
      <div className="exames">
        <div className="lista">
          <div className="cabecalho">
            <Select
              options={[
                { value: '', label: 'Selecione um tipo' },
                { value: 'Teste 1', label: 'Teste 1' },
                { value: 'Teste 2', label: 'Teste 2' },
              ]}
            />
            <input
              type="file"
            />
            <MdFileUpload className='icon'/>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>file</td>
                <td>11/02/2026</td>
                <td><MdFileDownload className="icon"/></td>
              </tr>
              <tr>
                <td>file</td>
                <td>11/02/2026</td>
                <td><MdFileDownload className="icon"/></td>
              </tr>
              <tr>
                <td>file</td>
                <td>11/02/2026</td>
                <td><MdFileDownload className="icon"/></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
