import './header.css';
import { useState } from 'react';
import { IoPersonCircleOutline, IoSync } from "react-icons/io5";
import { IoMdExit } from "react-icons/io";

import { useNavigate } from 'react-router-dom';

export function Header(props) {
    const [menu, setMenu] = useState('')
    const navigate = useNavigate();

    return (
        <header>
            <p className='nome'>{props.nome}</p>
            <div className='buttons'>
                <div className='divisor'/>
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
    )
}