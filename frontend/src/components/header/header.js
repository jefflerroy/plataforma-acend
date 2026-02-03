import './header.css';
import { useState } from 'react';
import { IoPersonCircleOutline, IoSync } from "react-icons/io5";

import { useNavigate } from 'react-router-dom';

export function Header(props) {
    const [menu, setMenu] = useState('')
    const navigate = useNavigate();

    return (
        <header>
            <p className='nome'>{props.nome}</p>
            <div className='buttons'>
                <button>
                    <IoSync/>
                    Sincronizar
                </button>
                <div className='divisor'/>
                <button>
                    <IoPersonCircleOutline/>
                    Meu Perfil
                </button>
            </div>
        </header>
    )
}