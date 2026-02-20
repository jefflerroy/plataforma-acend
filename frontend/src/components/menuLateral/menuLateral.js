import './menuLateral.css';
import { useEffect, useState } from 'react';
import { ImSpoonKnife } from "react-icons/im";
import { LuLayoutDashboard, LuCalendar } from "react-icons/lu";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdOutlineChatBubbleOutline, MdOutlinePeopleAlt, MdOutlineSettings } from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";

import logoPequena from '../../assets/logoPequena.png'
import anonimo from '../../assets/anonimo.png'
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';

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
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const [foto, setFoto] = useState('');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await api.get("/me");
                const data = response.data;
                setUserId(data.id);
                setNome(data.nome);
                setTipo(data.tipo)
                setFoto(data.foto)
            } catch (err) {
                console.error(err);
            }
        }

        loadUser();

        socket.on('usuario:updated', ({ id, data }) => {
            if (id === userId) { 
                setNome(data.nome);
                setTipo(data.tipo);
                setFoto(data.foto);
            }
        });

        return () => {
            socket.off('usuario:updated');
        };
    }, [userId]);

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
            text: 'Agenda',
            rota: 'agenda',
            icon: <LuCalendar className='icon' />,
            roles: ['admin', 'medico']
        },
        {
            text: 'Minha Dieta',
            rota: 'minha-dieta',
            icon: <ImSpoonKnife className='icon' />,
            roles: ['paciente']
        },
        {
            text: 'Usuários',
            rota: 'usuarios',
            icon: <MdOutlinePeopleAlt className='icon' />,
            roles: ['admin']
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
            roles: ['admin', 'medico', 'paciente']
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
        {
            text: 'Configurações',
            rota: 'configuracoes',
            icon: <MdOutlineSettings className='icon' />,
            roles: ['admin']
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
                <img alt='perfil' className='perfil' src={foto || anonimo} />
                <div className='column' id='logo-titulo'>
                    <p className='logo-titulo'>{nome}</p>
                    <p className='logo-subtitulo'>{tipo?.toUpperCase()}</p>
                </div>
            </div>
        </div>
    );
}
