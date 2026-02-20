import "./configuracoes.css";
import { Header } from "../../components/header/header";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { Input } from "../../components/input/input";
import { Select } from "../../components/select/select";
import { Modal } from "../../components/modal/modal";

export function Configuracoes() {
  const navigate = useNavigate();

  return (
    <>
      <Header nome="Configurações"/>

      <div className="configuracoes">
        
      </div>      
    </>
  );
}
