import './menuLateral.css';
import { useEffect, useRef, useState } from 'react';
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

    const [open, setOpen] = useState(false);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const tracking = useRef(false);

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await api.get("/me");
                const data = response.data;
                setUserId(data.id);
                setNome(data.nome);
                setTipo(data.tipo);
                setFoto(data.foto);
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

    useEffect(() => {
        function toggleMenu() {
            setOpen(prev => !prev);
        }

        window.addEventListener('toggle-menu', toggleMenu);

        return () => {
            window.removeEventListener('toggle-menu', toggleMenu);
        };
    }, []);

    useEffect(() => {
        function onTouchStart(e) {
            const t = e.touches[0];
            touchStartX.current = t.clientX;
            touchStartY.current = t.clientY;
            tracking.current = touchStartX.current <= 24;
        }

        function onTouchMove(e) {
            if (!tracking.current) return;
            const t = e.touches[0];
            const dx = t.clientX - touchStartX.current;
            const dy = t.clientY - touchStartY.current;
            if (Math.abs(dy) > 20) {
                tracking.current = false;
                return;
            }
            if (dx > 60) {
                setOpen(true);
                tracking.current = false;
            }
        }

        function onTouchEnd() {
            tracking.current = false;
        }

        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, []);

    const navegarMenu = (rota) => {
        navigate(rota);
        setMenu(rota);
        setOpen(false);
    };

    const menus = [
        { text: 'Início', rota: 'inicio', icon: <LuLayoutDashboard className='icon' />, roles: ['paciente'] },
        { text: 'Agenda', rota: 'agenda', icon: <LuCalendar className='icon' />, roles: ['admin', 'medico'] },
        { text: 'Minha Dieta', rota: 'minha-dieta', icon: <ImSpoonKnife className='icon' />, roles: ['paciente'] },
        { text: 'Usuários', rota: 'usuarios', icon: <MdOutlinePeopleAlt className='icon' />, roles: ['admin'] },
        { text: 'Pacientes', rota: 'pacientes', icon: <MdOutlinePeopleAlt className='icon' />, roles: ['admin', 'medico'] },
        { text: 'Dietas', rota: 'dietas', icon: <ImSpoonKnife className='icon' />, roles: ['admin', 'medico'] },
        { text: 'Exames', rota: 'exames', icon: <FaRegFileAlt className='icon' />, roles: ['paciente'] },
        { text: 'Método Ascend', rota: 'metodo-ascend', icon: <FaArrowTrendUp className='icon' />, roles: ['paciente'] },
        { text: 'Comunidade', rota: 'comunidade', icon: <MdOutlinePeopleAlt className='icon' />, roles: ['admin', 'medico', 'paciente'] },
        { text: 'Minha Agenda', rota: 'minha-agenda', icon: <LuCalendar className='icon' />, roles: ['paciente'] },
        { text: 'Evolução', rota: 'evolucao', icon: <FaArrowTrendUp className='icon' />, roles: ['paciente'] },
        { text: 'Dúvidas IA', rota: 'duvidas-ia', icon: <MdOutlineChatBubbleOutline className='icon' />, roles: ['paciente'] },
        { text: 'Configurações', rota: 'configuracoes', icon: <MdOutlineSettings className='icon' />, roles: ['admin'] },
    ];

    return (
        <>
            {open && (
                <div
                    className="menu-overlay"
                    onClick={() => setOpen(false)}
                />
            )}

            <div className={`menu-lateral ${open ? 'menu-lateral--open' : ''}`}>
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
        </>
    );
}