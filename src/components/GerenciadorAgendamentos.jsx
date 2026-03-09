import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const tiposAtividade = {
  CONSULTORIA: 'Consultoria',
  TREINAMENTO: 'Treinamento',
  EXTERNO: 'Externo',
  PESSOAL: 'Pessoal'
};

export const GerenciadorAgendamentos = ({ agendamentos, setAgendamentos, clientes, profissionais }) => {
  const [novoAgendamento, setNovoAgendamento] = useState(null);
  const [editandoAgendamento, setEditandoAgendamento] = useState(null);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const criarAgendamento = () => {
    setNovoAgendamento({
      id: Date.now(),
      data: new Date().toISOString().split('T')[0],
      horaInicio: '09:00',
      horaFim: '10:00',
      cliente: '',
      descricao: '',
      lancadoPor: 'Bianca',
      temPausa: false,
      pausaMinutos: 60,
      horas: '1',
      valor: '0',
      tipo: 'CONSULTORIA',
      profissional: ''
    });
  };

  const calcularHoras = (horaInicio, horaFim, temPausa, pausaMinutos) => {
    if (!horaInicio || !horaFim) return 0;
    
    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaFim_, minFim] = horaFim.split(':').map(Number);
    
    let diferencaMinutos = (horaFim_ * 60 + minFim) - (horaIni * 60 + minIni);
    
    if (diferencaMinutos < 0) {
      diferencaMinutos += 24 * 60;
    }
    
    if (temPausa) {
      diferencaMinutos -= pausaMinutos;
    }
    
    return (diferencaMinutos / 60).toFixed(1);
  };

  const calcularValor = (horas, clienteId) => {
    const cliente = clientes.find(c => c.id == clienteId);
    if (!cliente) return '0';
    return (parseFloat(horas) * parseFloat(cliente.valorHora)).toFixed(2);
  };

  const salvarAgendamento = () => {
    if (!novoAgendamento || !novoAgendamento.cliente) {
      alert('Selecione um cliente');
      return;
    }

    // Recalcular horas e valor
    const horas = calcularHoras(
      novoAgendamento.horaInicio,
      novoAgendamento.horaFim,
      novoAgendamento.temPausa,
      novoAgendamento.pausaMinutos
    );

    const valor = novoAgendamento.tipo === 'PESSOAL' 
      ? '0' 
      : calcularValor(horas, novoAgendamento.cliente);

    const agendamentoComValores = {
      ...novoAgendamento,
      horas,
      valor
    };

    if (editandoAgendamento) {
      setAgendamentos(agendamentos.map(a => a.id === editandoAgendamento.id ? agendamentoComValores : a));
    } else {
      setAgendamentos([...agendamentos, agendamentoComValores]);
    }

    setNovoAgendamento(null);
    setEditandoAgendamento(null);
  };

  const editarAgendamento = (agendamento) => {
    setNovoAgendamento({ ...agendamento });
    setEditandoAgendamento(agendamento);
  };

  const deletarAgendamento = (id) => {
    setAgendamentos(agendamentos.filter(a => a.id !== id));
  };

  const agendamentosFiltrados = agendamentos.filter(a => {
    if (filtroCliente && a.cliente !== filtroCliente) return false;
    if (filtroTipo && a.tipo !== filtroTipo) return false;
    return true;
  });

  const totalFaturamento = agendamentosFiltrados
    .filter(a => a.tipo !== 'PESSOAL')
    .reduce((sum, a) => sum + parseFloat(a.valor || 0), 0);

  return (
    <div className="gerenciador-agendamentos">
      {/* Filtros e Botão Novo */}
      <div className="agendamentos-header">
        <div className="agendamentos-filtros">
          <select 
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todos os Clientes</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <select 
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todos os Tipos</option>
            {Object.entries(tiposAtividade).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {!novoAgendamento && (
          <button onClick={criarAgendamento} className="btn-primario">
            <Plus size={18} /> Novo Agendamento
          </button>
        )}
      </div>

      {/* Formulário */}
      {novoAgendamento && (
        <div className="agendamento-form">
          <h3>{editandoAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>

          <div className="form-row">
            <div className="form-grupo">
              <label>Data:</label>
              <input 
                type="date"
                value={novoAgendamento.data}
                onChange={(e) => setNovoAgendamento({ ...novoAgendamento, data: e.target.value })}
              />
            </div>

            <div className="form-grupo">
              <label>Hora Início:</label>
              <input 
                type="time"
                value={novoAgendamento.horaInicio}
                onChange={(e) => setNovoAgendamento({ ...novoAgendamento, horaInicio: e.target.value })}
              />
            </div>

            <div className="form-grupo">
              <label>Hora Fim:</label>
              <input 
                type="time"
                value={novoAgendamento.horaFim}
                onChange={(e) => setNovoAgendamento({ ...novoAgendamento, horaFim: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-grupo">
              <label>Cliente:</label>
              <select 
                value={novoAgendamento.cliente}
                onChange={(e) => setNovoAgendamento({ ...novoAgendamento, cliente: e.target.value })}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-grupo">
              <label>Tipo de Atividade:</label>
              <select 
                value={novoAgendamento.tipo}
                onChange={(e) => setNovoAgendamento({ ...novoAgendamento, tipo: e.target.value })}
              >
                {Object.entries(tiposAtividade).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-grupo">
              <label>Profissional:</label>
              <input 
                type="text"
                value={novoAgendamento.profissional}
                onChange={(e) => setNovoAgendamento({ ...novoAgendamento, profissional: e.target.value })}
                placeholder="Nome do profissional"
              />
            </div>
          </div>

          <div className="form-grupo">
            <label>Descrição:</label>
            <textarea 
              value={novoAgendamento.descricao}
              onChange={(e) => setNovoAgendamento({ ...novoAgendamento, descricao: e.target.value })}
              placeholder="Descrição da atividade"
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-grupo checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={novoAgendamento.temPausa}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, temPausa: e.target.checked })}
                />
                Tem Pausa?
              </label>
            </div>

            {novoAgendamento.temPausa && (
              <div className="form-grupo">
                <label>Minutos de Pausa:</label>
                <input 
                  type="number"
                  value={novoAgendamento.pausaMinutos}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, pausaMinutos: parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>

          {novoAgendamento.tipo !== 'PESSOAL' && (
            <div className="form-row">
              <div className="form-grupo">
                <label>Horas:</label>
                <input 
                  type="number"
                  value={novoAgendamento.horas}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, horas: e.target.value })}
                  step="0.1"
                  readOnly
                />
              </div>

              <div className="form-grupo">
                <label>Valor:</label>
                <input 
                  type="number"
                  value={novoAgendamento.valor}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, valor: e.target.value })}
                  step="0.01"
                  readOnly
                />
              </div>
            </div>
          )}

          {novoAgendamento.tipo === 'PESSOAL' && (
            <div className="info-pessoal">
              ⚠️ Atividades pessoais não geram faturamento e não aparecem no financeiro
            </div>
          )}

          <div className="form-actions">
            <button onClick={salvarAgendamento} className="btn-sucesso">Salvar Agendamento</button>
            <button 
              onClick={() => {
                setNovoAgendamento(null);
                setEditandoAgendamento(null);
              }}
              className="btn-cancelar"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Resumo */}
      <div className="agendamentos-resumo">
        <div className="card">
          <h5>Agendamentos</h5>
          <p>{agendamentosFiltrados.length}</p>
        </div>
        <div className="card">
          <h5>Faturamento</h5>
          <p>R$ {totalFaturamento.toFixed(2)}</p>
        </div>
      </div>

      {/* Lista */}
      <div className="agendamentos-lista">
        {agendamentosFiltrados.length === 0 ? (
          <p className="sem-dados">Nenhum agendamento encontrado</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Profissional</th>
                <th>Horas</th>
                <th>Valor</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {agendamentosFiltrados.map(agendamento => {
                const cliente = clientes.find(c => c.id == agendamento.cliente);
                return (
                  <tr key={agendamento.id} className={`tipo-${agendamento.tipo.toLowerCase()}`}>
                    <td>{agendamento.data}</td>
                    <td>{agendamento.horaInicio} - {agendamento.horaFim}</td>
                    <td>{cliente?.nome || 'N/A'}</td>
                    <td>
                      <span className={`badge tipo-${agendamento.tipo.toLowerCase()}`}>
                        {tiposAtividade[agendamento.tipo]}
                      </span>
                    </td>
                    <td>{agendamento.profissional || '-'}</td>
                    <td>{agendamento.horas || '-'}</td>
                    <td>
                      {agendamento.tipo === 'PESSOAL' ? '-' : `R$ ${parseFloat(agendamento.valor).toFixed(2)}`}
                    </td>
                    <td className="acoes">
                      <button 
                        onClick={() => editarAgendamento(agendamento)}
                        className="btn-editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => deletarAgendamento(agendamento.id)}
                        className="btn-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export { tiposAtividade };
