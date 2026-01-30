import './menuLateral.css';
import { useEffect, useState } from 'react';
import { ImSpoonKnife } from "react-icons/im";
import { LuLayoutDashboard, LuCalendar  } from "react-icons/lu";
import { FaArrowTrendUp } from "react-icons/fa6";
import { GoPeople } from "react-icons/go";
import { MdOutlineChatBubbleOutline, MdOutlinePeopleAlt } from "react-icons/md";

import logoPequena from '../../assets/logoPequena.png'
import perfil from '../../assets/ronaldinho.png'

function ButtonMenu({ icon, text, ariaPressed = false, onClick }) {
    return (
      <button className="menu" aria-pressed={ariaPressed} onClick={onClick}>
        {icon}
        {text}
      </button>
    );
  }

export function MenuLateral() {
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
                ariaPressed={true}
            />
            <ButtonMenu 
                icon={<ImSpoonKnife className='icon'/>}
                text='Minha Dieta'                
            />
            <ButtonMenu 
                icon={<FaArrowTrendUp className='icon'/>}
                text='Método Ascend'                
            />
            <ButtonMenu 
                icon={<MdOutlinePeopleAlt className='icon'/>}
                text='Comunidade'                
            />
            <ButtonMenu 
                icon={<LuCalendar className='icon'/>}
                text='Minha Agenda'                
            />
            <ButtonMenu 
                icon={<FaArrowTrendUp className='icon'/>}
                text='Evolução'                
            />
            <ButtonMenu 
                icon={<MdOutlineChatBubbleOutline className='icon'/>}
                text='Dúvidas IA'                
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