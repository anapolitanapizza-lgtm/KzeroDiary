import React, { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const AnotacoesReembolsos = ({ anotacoes, setAnotacoes, reembolsos, setReembolsos, clientes }) => {
  const [abaSelecionada, setAbaSelecionada] = useState('anotacoes');
  const [novaAnotacao, setNovaAnotacao] = useState(null);
  const [novoReembolso, setNovoReembolso] = useState(null);
  const [filtroClienteAnotacoes, setFiltroClienteAnotacoes] = useState('');
  const [filtroClienteReembolsos, setFiltroClienteReembolsos] = useState('');

  // ===== ANOTAÇÕES =====

  const criarAnotacao = () => {
    setNovaAnotacao({
      id: Date.now(),
      data: new Date().toISOString().split('T')[0],
      clienteId: '',
      titulo: '',
      conteudo: ''
    });
  };

  const salvarAnotacao = () => {
    if (!novaAnotacao || !novaAnotacao.clienteId || !novaAnotacao.titulo) {
      alert('Preencha cliente, titulo e conteúdo');
      return;
    }
    setAnotacoes([...anotacoes, novaAnotacao]);
    setNovaAnotacao(null);
  };

  const deletarAnotacao = (id) => {
    setAnotacoes(anotacoes.filter(a => a.id !== id));
  };

  const anotacoesFiltradas = filtroClienteAnotacoes
    ? anotacoes.filter(a => a.clienteId === filtroClienteAnotacoes)
    : anotacoes;

  // ===== REEMBOLSOS =====

  const criarReembolso = () => {
    setNovoReembolso({
      id: Date.now(),
      data: new Date().toISOString().split('T')[0],
      clienteId: '',
      descricao: '',
      valor: '',
      status: 'PENDENTE'
    });
  };

  const salvarReembolso = () => {
    if (!novoReembolso || !novoReembolso.clienteId || !novoReembolso.valor) {
      alert('Preencha cliente e valor');
      return;
    }
    setReembolsos([...reembolsos, novoReembolso]);
    setNovoReembolso(null);
  };

  const deletarReembolso = (id) => {
    setReembolsos(reembolsos.filter(r => r.id !== id));
  };

  const reembolsosFiltrados = filtroClienteReembolsos
    ? reembolsos.filter(r => r.clienteId === filtroClienteReembolsos)
    : reembolsos;

  const totalReembolsosPendentes = reembolsosFiltrados
    .filter(r => r.status === 'PENDENTE')
    .reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);

  const totalReembolsosPagos = reembolsosFiltrados
    .filter(r => r.status === 'PAGO')
    .reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);

  return (
    <div className="anotacoes-reembolsos">
      {/* Abas */}
      <div className="abas-container">
        <button 
          className={`aba ${abaSelecionada === 'anotacoes' ? 'ativa' : ''}`}
          onClick={() => setAbaSelecionada('anotacoes')}
        >
          📝 Anotações ({anotacoesFiltradas.length})
        </button>
        <button 
          className={`aba ${abaSelecionada === 'reembolsos' ? 'ativa' : ''}`}
          onClick={() => setAbaSelecionada('reembolsos')}
        >
          💰 Reembolsos ({reembolsosFiltrados.length})
        </button>
      </div>

      {/* ABA ANOTAÇÕES */}
      {abaSelecionada === 'anotacoes' && (
        <div className="aba-conteudo">
          <div className="header-secao">
            <div className="filtro-grupo">
              <label>Filtrar por Cliente:</label>
              <select 
                value={filtroClienteAnotacoes}
                onChange={(e) => setFiltroClienteAnotacoes(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todas as Anotações</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {!novaAnotacao && (
              <button onClick={criarAnotacao} className="btn-primario">
                <Plus size={18} /> Nova Anotação
              </button>
            )}
          </div>

          {/* Formulário Nova Anotação */}
          {novaAnotacao && (
            <div className="anotacao-form">
              <h3>Nova Anotação</h3>
              
              <div className="form-row">
                <div className="form-grupo">
                  <label>Cliente:</label>
                  <select 
                    value={novaAnotacao.clienteId}
                    onChange={(e) => setNovaAnotacao({ ...novaAnotacao, clienteId: e.target.value })}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Data:</label>
                  <input 
                    type="date"
                    value={novaAnotacao.data}
                    onChange={(e) => setNovaAnotacao({ ...novaAnotacao, data: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label>Título:</label>
                <input 
                  type="text"
                  value={novaAnotacao.titulo}
                  onChange={(e) => setNovaAnotacao({ ...novaAnotacao, titulo: e.target.value })}
                  placeholder="Resumo da anotação"
                />
              </div>

              <div className="form-grupo">
                <label>Conteúdo:</label>
                <textarea 
                  value={novaAnotacao.conteudo}
                  onChange={(e) => setNovaAnotacao({ ...novaAnotacao, conteudo: e.target.value })}
                  placeholder="Detalhes da anotação"
                  rows="5"
                />
              </div>

              <div className="form-actions">
                <button onClick={salvarAnotacao} className="btn-sucesso">Salvar Anotação</button>
                <button 
                  onClick={() => setNovaAnotacao(null)}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de Anotações */}
          <div className="anotacoes-lista">
            {anotacoesFiltradas.length === 0 ? (
              <p className="sem-dados">Nenhuma anotação registrada</p>
            ) : (
              anotacoesFiltradas.map(anotacao => {
                const cliente = clientes.find(c => c.id == anotacao.clienteId);
                return (
                  <div key={anotacao.id} className="anotacao-card">
                    <div className="anotacao-header">
                      <div>
                        <h4>{anotacao.titulo}</h4>
                        <p className="anotacao-meta">{cliente?.nome} • {anotacao.data}</p>
                      </div>
                      <button 
                        onClick={() => deletarAnotacao(anotacao.id)}
                        className="btn-danger-pequeno"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="anotacao-conteudo">{anotacao.conteudo}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ABA REEMBOLSOS */}
      {abaSelecionada === 'reembolsos' && (
        <div className="aba-conteudo">
          <div className="header-secao">
            <div className="filtro-grupo">
              <label>Filtrar por Cliente:</label>
              <select 
                value={filtroClienteReembolsos}
                onChange={(e) => setFiltroClienteReembolsos(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos os Reembolsos</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            {!novoReembolso && (
              <button onClick={criarReembolso} className="btn-primario">
                <Plus size={18} /> Novo Reembolso
              </button>
            )}
          </div>

          {/* Resumo Reembolsos */}
          <div className="reembolsos-resumo">
            <div className="card pendente">
              <h5>Pendentes</h5>
              <p>R$ {totalReembolsosPendentes.toFixed(2)}</p>
            </div>
            <div className="card pago">
              <h5>Pagos</h5>
              <p>R$ {totalReembolsosPagos.toFixed(2)}</p>
            </div>
            <div className="card total">
              <h5>Total</h5>
              <p>R$ {(totalReembolsosPendentes + totalReembolsosPagos).toFixed(2)}</p>
            </div>
          </div>

          {/* Formulário Novo Reembolso */}
          {novoReembolso && (
            <div className="reembolso-form">
              <h3>Novo Reembolso</h3>
              
              <div className="form-row">
                <div className="form-grupo">
                  <label>Cliente:</label>
                  <select 
                    value={novoReembolso.clienteId}
                    onChange={(e) => setNovoReembolso({ ...novoReembolso, clienteId: e.target.value })}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Data:</label>
                  <input 
                    type="date"
                    value={novoReembolso.data}
                    onChange={(e) => setNovoReembolso({ ...novoReembolso, data: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label>Descrição:</label>
                <input 
                  type="text"
                  value={novoReembolso.descricao}
                  onChange={(e) => setNovoReembolso({ ...novoReembolso, descricao: e.target.value })}
                  placeholder="Ex: Passagens aéreas, hospedagem, etc"
                />
              </div>

              <div className="form-row">
                <div className="form-grupo">
                  <label>Valor:</label>
                  <input 
                    type="number"
                    value={novoReembolso.valor}
                    onChange={(e) => setNovoReembolso({ ...novoReembolso, valor: e.target.value })}
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-grupo">
                  <label>Status:</label>
                  <select 
                    value={novoReembolso.status}
                    onChange={(e) => setNovoReembolso({ ...novoReembolso, status: e.target.value })}
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button onClick={salvarReembolso} className="btn-sucesso">Salvar Reembolso</button>
                <button 
                  onClick={() => setNovoReembolso(null)}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de Reembolsos */}
          <div className="reembolsos-lista">
            {reembolsosFiltrados.length === 0 ? (
              <p className="sem-dados">Nenhum reembolso registrado</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {reembolsosFiltrados.map(reembolso => {
                    const cliente = clientes.find(c => c.id == reembolso.clienteId);
                    return (
                      <tr key={reembolso.id} className={reembolso.status === 'PAGO' ? 'pago' : 'pendente'}>
                        <td>{reembolso.data}</td>
                        <td>{cliente?.nome || 'Desconhecido'}</td>
                        <td>{reembolso.descricao}</td>
                        <td>R$ {parseFloat(reembolso.valor).toFixed(2)}</td>
                        <td>
                          <span className={`badge ${reembolso.status.toLowerCase()}`}>
                            {reembolso.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => deletarReembolso(reembolso.id)}
                            className="btn-danger-pequeno"
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
      )}
    </div>
  );
};
