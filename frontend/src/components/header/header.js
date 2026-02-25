import './header.css';
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoMdExit } from "react-icons/io";
import { TiThMenu } from "react-icons/ti";
import { useNavigate } from 'react-router-dom';

export function Header(props) {
    const navigate = useNavigate();

    function abrirMenu() {
        window.dispatchEvent(new CustomEvent('toggle-menu'));
    }

    return (
        <header>
            <div className='row'>
                <TiThMenu className='icon menu-mobile' onClick={abrirMenu} />
                <p className='nome'>{props.nome}</p>
            </div>

            <div className='buttons'>
                <div className='divisor' />
                <button onClick={() => navigate('/meu-perfil')}>
                    <IoPersonCircleOutline />
                    Meu Perfil
                </button>
                <button className='sair' onClick={() => navigate('/')}>
                    <IoMdExit />
                    Sair
                </button>
            </div>
        </header>
    );
}