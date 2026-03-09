import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const tiposAtividade = {
  CONSULTORIA: { label: 'Consultoria', color: '#3b82f6', bgColor: 'rgb(59, 130, 246, 0.1)' },
  TREINAMENTO: { label: 'Treinamento', color: '#10b981', bgColor: 'rgb(16, 185, 129, 0.1)' },
  EXTERNO: { label: 'Externo', color: '#ef4444', bgColor: 'rgb(239, 68, 68, 0.1)' },
  PESSOAL: { label: 'Pessoal', color: '#f59e0b', bgColor: 'rgb(245, 158, 11, 0.1)' }
};

export const Calendario = ({ agendamentos, clientes, profissionais, onFiltroChange }) => {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const diasMes = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasAntes = primeiroDia.getDay();
    const diasMes = ultimoDia.getDate();

    return Array(diasAntes).fill(null)
      .concat(Array.from({ length: diasMes }, (_, i) => i + 1));
  }, [mesAtual]);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter(a => {
      if (filtroCliente && a.cliente !== filtroCliente) return false;
      if (filtroTipo && a.tipo !== filtroTipo) return false;
      return true;
    });
  }, [agendamentos, filtroCliente, filtroTipo]);

  const getAgendamentosDoDay = (dia) => {
    if (!dia) return [];
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return agendamentosFiltrados.filter(a => a.data === dataStr);
  };

  const handlePrevMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1));
  };

  const handleNextMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1));
  };

  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const nomesDisponiveis = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <div className="calendario-container">
      {/* Filtros */}
      <div className="calendario-filtros">
        <div className="filtro-grupo">
          <label>Cliente:</label>
          <select 
            value={filtroCliente} 
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todos</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Tipo de Atividade:</label>
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todos</option>
            {Object.entries(tiposAtividade).map(([key, tipo]) => (
              <option key={key} value={key}>{tipo.label}</option>
            ))}
          </select>
        </div>

        {(filtroCliente || filtroTipo) && (
          <button 
            className="btn-limpar-filtros"
            onClick={() => {
              setFiltroCliente('');
              setFiltroTipo('');
            }}
          >
            <X size={16} /> Limpar Filtros
          </button>
        )}
      </div>

      {/* Calendário */}
      <div className="calendario">
        <div className="calendario-header">
          <button onClick={handlePrevMes} className="btn-nav">
            <ChevronLeft size={20} />
          </button>
          <h2>{nomesMeses[mesAtual.getMonth()]} {mesAtual.getFullYear()}</h2>
          <button onClick={handleNextMes} className="btn-nav">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendario-dias-semana">
          {nomesDisponiveis.map(dia => (
            <div key={dia} className="dia-semana">{dia}</div>
          ))}
        </div>

        <div className="calendario-dias">
          {diasMes.map((dia, idx) => (
            <div 
              key={idx} 
              className={`dia-mes ${dia ? 'ativo' : 'vazio'}`}
            >
              {dia && (
                <>
                  <div className="numero-dia">{dia}</div>
                  <div className="eventos-dia">
                    {getAgendamentosDoDay(dia).map((evento) => {
                      const cliente = clientes.find(c => String(c.id) === String(evento.cliente));
                      const tipo = evento.tipo || 'CONSULTORIA';
                      const corTipo = tiposAtividade[tipo];
                      
                      return (
                        <div 
                          key={evento.id}
                          className="evento-dia"
                          style={{ 
                            borderLeft: `3px solid ${corTipo.color}`,
                            backgroundColor: corTipo.bgColor
                          }}
                          title={`${cliente?.nome || 'N/A'} - ${evento.profissional || 'N/A'}`}
                        >
                          <div className="evento-hora">{evento.horaInicio}</div>
                          <div className="evento-info">
                            <div className="evento-profissional">{evento.profissional || '?'}</div>
                            <div className="evento-cliente">{cliente?.nome.substring(0, 10)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="calendario-legenda">
        <h4>Legenda de Tipos:</h4>
        <div className="legenda-itens">
          {Object.entries(tiposAtividade).map(([key, tipo]) => (
            <div key={key} className="legenda-item">
              <div 
                className="legenda-cor"
                style={{ backgroundColor: tipo.color }}
              ></div>
              <span>{tipo.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { tiposAtividade };
