import './menuLateral.css';
import { useEffect, useState } from 'react';
import { ImSpoonKnife } from "react-icons/im";
import { LuLayoutDashboard, LuCalendar  } from "react-icons/lu";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdOutlineChatBubbleOutline, MdOutlinePeopleAlt } from "react-icons/md";

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
    const [menu, setMenu] = useState('')
    const navigate = useNavigate();

    const navegarMenu = (menu) => {
        navigate(menu)
        setMenu(menu);        
    }

    return (
        <div className='menu-lateral'>
            <div className='row' id='logo'>
                <img alt='logo-pequena' className='logo-pequena' src={logoPequena} />
                <div className='column' id='logo-titulo'>
                    <p className='logo-titulo'>ASCEND</p>
                    <p className='logo-subtitulo'>NUTROLOGIA DE ELITE</p>
                </div>
            </div>
            <ButtonMenu 
                icon={<LuLayoutDashboard className='icon'/>}
                text='Início'
                ariaPressed={menu === 'inicio'}
                onClick={() => navegarMenu('inicio')}
            />
            <ButtonMenu 
                icon={<ImSpoonKnife className='icon'/>}
                text='Minha Dieta'             
                ariaPressed={menu === 'minha-dieta'}   
                onClick={() => navegarMenu('minha-dieta')}
            />
            <ButtonMenu 
                icon={<FaArrowTrendUp className='icon'/>}
                text='Método Ascend'           
                ariaPressed={menu === 'metodo-ascend'}     
                onClick={() => navegarMenu('metodo-ascend')}
            />
            <ButtonMenu 
                icon={<MdOutlinePeopleAlt className='icon'/>}
                text='Comunidade'              
                ariaPressed={menu === 'comunidade'}  
                onClick={() => navegarMenu('comunidade')}
            />
            <ButtonMenu 
                icon={<LuCalendar className='icon'/>}
                text='Minha Agenda'            
                ariaPressed={menu === 'minha-agenda'}    
                onClick={() => navegarMenu('minha-agenda')}
            />
            <ButtonMenu 
                icon={<FaArrowTrendUp className='icon'/>}
                text='Evolução'                
                ariaPressed={menu === 'evolucao'}
                onClick={() => navegarMenu('evolucao')}
            />
            <ButtonMenu 
                icon={<MdOutlineChatBubbleOutline className='icon'/>}
                text='Dúvidas IA'              
                ariaPressed={menu === 'duvidas-ia'}  
                onClick={() => navegarMenu('duvidas-ia')}
            />
            <div className='row' id='inferior'>
                <img alt='perfil' className='perfil' src={perfil} />
                <div className='column' id='logo-titulo'>
                    <p className='logo-titulo'>Ronaldinho Gaúcho</p>
                    <p className='logo-subtitulo'>Paciente VIP</p>
                </div>
            </div>
        </div>
    )
}