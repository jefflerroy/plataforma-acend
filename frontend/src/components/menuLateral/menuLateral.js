import './menuLateral.css';
import { useState } from 'react';
import { ImSpoonKnife } from "react-icons/im";
import { LuLayoutDashboard, LuCalendar } from "react-icons/lu";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdOutlineChatBubbleOutline, MdOutlinePeopleAlt } from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";

import logoPequena from '../../assets/logoPequena.png'
import perfil from '../../assets/ronaldinho.png'
import { useNavigate } from 'react-router-dom';

function ButtonMenu({ icon, text, ariaPressed = false, onClick }) {
    return (
        <button className="menu" aria-pressed={ariaPressed} onClick={onClick}>
            {icon}
            {text}
        </button>
    );
}

export function MenuLateral() {
    const navigate = useNavigate();
    const [menu, setMenu] = useState('');

    const nome = localStorage.getItem('nome');
    const tipo = localStorage.getItem('tipo');

    const navegarMenu = (rota) => {
        navigate(rota);
        setMenu(rota);
    };
    
    const menus = [
        {
            text: 'Início',
            rota: 'inicio',
            icon: <LuLayoutDashboard className='icon' />,
            roles: ['paciente']
        },
        {
            text: 'Minha Dieta',
            rota: 'minha-dieta',
            icon: <ImSpoonKnife className='icon' />,
            roles: ['paciente']
        },
        {
            text: 'Pacientes',
            rota: 'pacientes',
            icon: <MdOutlinePeopleAlt className='icon' />,
            roles: ['admin', 'medico']
        },
        {
            text: 'Dietas',
            rota: 'dietas',
            icon: <ImSpoonKnife className='icon' />,
            roles: ['admin', 'medico']
        },
        {
            text: 'Exames',
            rota: 'exames',
            icon: <FaRegFileAlt className='icon' />,
            roles: ['paciente']
        },
        {
            text: 'Método Ascend',
            rota: 'metodo-ascend',
            icon: <FaArrowTrendUp className='icon' />,
            roles: ['paciente']
        },
        {
            text: 'Comunidade',
            rota: 'comunidade',
            icon: <MdOutlinePeopleAlt className='icon' />,
            roles: ['paciente']
        },
        {
            text: 'Minha Agenda',
            rota: 'minha-agenda',
            icon: <LuCalendar className='icon' />,
            roles: ['paciente']
        },
        {
            text: 'Evolução',
            rota: 'evolucao',
            icon: <FaArrowTrendUp className='icon' />,
            roles: ['paciente']
        },
        {
            text: 'Dúvidas IA',
            rota: 'duvidas-ia',
            icon: <MdOutlineChatBubbleOutline className='icon' />,
            roles: ['paciente']
        },
    ];

    return (
        <div className='menu-lateral'>
            <div className='row' id='logo'>
                <img alt='logo-pequena' className='logo-pequena' src={logoPequena} />
                <div className='column' id='logo-titulo'>
                    <p className='logo-titulo'>ASCEND</p>
                    <p className='logo-subtitulo'>NUTROLOGIA DE ELITE</p>
                </div>
            </div>

            {menus
                .filter(item => item.roles.includes(tipo))
                .map(item => (
                    <ButtonMenu
                        key={item.rota}
                        icon={item.icon}
                        text={item.text}
                        ariaPressed={menu === item.rota}
                        onClick={() => navegarMenu(item.rota)}
                    />
                ))
            }

            <div className='row' id='inferior'>
                <img alt='perfil' className='perfil' src={perfil} />
                <div className='column' id='logo-titulo'>
                    <p className='logo-titulo'>{nome}</p>
                    <p className='logo-subtitulo'>{tipo?.toUpperCase()}</p>
                </div>
            </div>
        </div>
    );
}
