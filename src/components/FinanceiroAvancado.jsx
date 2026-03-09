import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const FinanceiroAvancado = ({ fluxoCaixa, setFluxoCaixa, agendamentos, clientes }) => {
  const [novoLancamento, setNovoLancamento] = useState(null);
  const [editandoLancamento, setEditandoLancamento] = useState(null);
  const [categorias, setCategorias] = useState(() => {
    const saved = localStorage.getItem('kzerodiary_categorias');
    return saved ? JSON.parse(saved) : [
      'Banco', 'Impostos', 'Fornecedores', 'Salários', 'Empréstimos', 'Outros Passivos'
    ];
  });
  const [novaCategoria, setNovaCategoria] = useState('');
  const [recorrencias, setRecorrencias] = useState(() => {
    const saved = localStorage.getItem('kzerodiary_recorrencias');
    return saved ? JSON.parse(saved) : [];
  });
  const [novaRecorrencia, setNovaRecorrencia] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroData, setFiltroData] = useState({ inicio: '', fim: '' });
  const recorrenciasProcessadas = useRef(false);

  useEffect(() => {
    localStorage.setItem('kzerodiary_categorias', JSON.stringify(categorias));
  }, [categorias]);

  useEffect(() => {
    localStorage.setItem('kzerodiary_recorrencias', JSON.stringify(recorrencias));
  }, [recorrencias]);

  // Gerar lançamentos recorrentes — só processa uma vez por mount
  useEffect(() => {
    if (recorrenciasProcessadas.current) return;
    recorrenciasProcessadas.current = true;

    const hoje = new Date();
    const lancamentosAProcessar = [];

    recorrencias.forEach(rec => {
      const ultimoLancamento = rec.ultimoLancamento ? new Date(rec.ultimoLancamento) : null;
      let proximaData = ultimoLancamento ? new Date(ultimoLancamento) : new Date(rec.dataInicio);

      switch (rec.frequencia) {
        case 'MENSAL':
          proximaData.setMonth(proximaData.getMonth() + 1);
          break;
        case 'SEMANAL':
          proximaData.setDate(proximaData.getDate() + 7);
          break;
        case 'QUINZENAL':
          proximaData.setDate(proximaData.getDate() + 15);
          break;
        default:
          return;
      }

      const proximaDataStr = proximaData.toISOString().split('T')[0];

      // Só cria se não existe lançamento com esse recorrenteId e data
      const jaExiste = fluxoCaixa.some(
        f => f.recorrenteId === rec.id && f.data === proximaDataStr
      );

      if (!jaExiste && proximaData <= hoje && (!rec.dataFim || proximaData <= new Date(rec.dataFim))) {
        lancamentosAProcessar.push({ ...rec, proximaData: proximaDataStr });
      }
    });

    if (lancamentosAProcessar.length === 0) return;

    const novosLancamentos = lancamentosAProcessar.map(rec => ({
      id: generateId(),
      data: rec.proximaData,
      tipo: rec.tipo,
      classificacao: rec.classificacao,
      categoria: rec.categoria,
      descricao: rec.descricao,
      valor: rec.valor,
      clienteId: rec.clienteId || '',
      recorrenteId: rec.id,
    }));

    setFluxoCaixa(prev => [...prev, ...novosLancamentos]);

    setRecorrencias(prev => prev.map(r => {
      const processado = lancamentosAProcessar.find(l => l.id === r.id);
      return processado ? { ...r, ultimoLancamento: processado.proximaData } : r;
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const automatizarValoresACobrar = () => {
    const hoje = new Date();
    const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const agendamentosParaCobrar = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data);
      const ehMesAnterior = dataAgendamento >= mesAnterior && dataAgendamento < mesAtual;
      const jaFoiLancado = fluxoCaixa.some(f => f.agendamentoId === a.id && f.tipo === 'RECEITA');
      return ehMesAnterior && !jaFoiLancado && a.tipo !== 'PESSOAL';
    });

    let diaUtil = 0;
    let data = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    while (diaUtil < 5) {
      const diaSemana = data.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) diaUtil++;
      if (diaUtil < 5) data.setDate(data.getDate() + 1);
    }
    const dataVencimento = data.toISOString().split('T')[0];

    const lancamentosPorCliente = {};
    agendamentosParaCobrar.forEach(a => {
      if (!lancamentosPorCliente[a.cliente]) lancamentosPorCliente[a.cliente] = 0;
      lancamentosPorCliente[a.cliente] += parseFloat(a.valor || 0);
    });

    const novos = Object.entries(lancamentosPorCliente).map(([clienteId, valor]) => {
      const cliente = clientes.find(c => String(c.id) === String(clienteId));
      return {
        id: generateId(),
        data: dataVencimento,
        tipo: 'RECEITA',
        classificacao: 'ATIVO',
        categoria: 'Banco',
        descricao: `Recebimento ${cliente?.nome || 'Cliente Desconhecido'} - Mês anterior`,
        valor: valor.toFixed(2),
        clienteId,
      };
    });

    if (novos.length === 0) {
      alert('Nenhum agendamento do mês anterior sem lançamento.');
      return;
    }

    setFluxoCaixa(prev => [...prev, ...novos]);
    alert(`${novos.length} lançamento(s) criado(s) com vencimento em ${dataVencimento}`);
  };

  const adicionarCategoria = () => {
    if (novaCategoria && !categorias.includes(novaCategoria)) {
      setCategorias([...categorias, novaCategoria]);
      setNovaCategoria('');
    }
  };

  const removerCategoria = (cat) => {
    setCategorias(categorias.filter(c => c !== cat));
  };

  const criarRecorrencia = () => {
    setNovaRecorrencia({
      id: generateId(),
      tipo: 'DESPESA',
      classificacao: 'PASSIVO',
      categoria: categorias[0] || '',
      descricao: '',
      valor: '',
      frequencia: 'MENSAL',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      ultimoLancamento: null,
    });
  };

  const salvarRecorrencia = () => {
    if (!novaRecorrencia || !novaRecorrencia.descricao || !novaRecorrencia.valor) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    setRecorrencias([...recorrencias, novaRecorrencia]);
    setNovaRecorrencia(null);
  };

  const deletarRecorrencia = (id) => {
    setRecorrencias(recorrencias.filter(r => r.id !== id));
  };

  // Lançamento manual
  const criarLancamento = () => {
    setNovoLancamento({
      id: generateId(),
      data: new Date().toISOString().split('T')[0],
      tipo: 'DESPESA',
      classificacao: 'PASSIVO',
      categoria: categorias[0] || '',
      descricao: '',
      valor: '',
    });
    setEditandoLancamento(null);
  };

  const editarLancamento = (fc) => {
    setNovoLancamento({ ...fc });
    setEditandoLancamento(fc);
  };

  const salvarLancamento = () => {
    if (!novoLancamento || !novoLancamento.descricao || !novoLancamento.valor) {
      alert('Preencha descrição e valor.');
      return;
    }
    if (editandoLancamento) {
      setFluxoCaixa(fluxoCaixa.map(f => f.id === editandoLancamento.id ? novoLancamento : f));
    } else {
      setFluxoCaixa([...fluxoCaixa, novoLancamento]);
    }
    setNovoLancamento(null);
    setEditandoLancamento(null);
  };

  const deletarLancamento = (id) => {
    if (!window.confirm('Excluir este lançamento?')) return;
    setFluxoCaixa(fluxoCaixa.filter(f => f.id !== id));
  };

  const fluxoFiltrado = fluxoCaixa.filter(f => {
    if (filtroTipo && f.tipo !== filtroTipo) return false;
    if (filtroCategoria && f.categoria !== filtroCategoria) return false;
    if (filtroData.inicio && new Date(f.data) < new Date(filtroData.inicio)) return false;
    if (filtroData.fim && new Date(f.data) > new Date(filtroData.fim)) return false;
    return true;
  });

  const totalReceitas = fluxoFiltrado
    .filter(f => f.tipo === 'RECEITA')
    .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);

  const totalDespesas = fluxoFiltrado
    .filter(f => f.tipo === 'DESPESA')
    .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);

  return (
    <div className="financeiro-avancado">
      <div className="financeiro-tabs">
        <div className="tab-content">
          <h3>🎯 Automação de Receitas</h3>
          <p>Automatizar lançamentos de valores a cobrar dos agendamentos para o financeiro</p>
          <button onClick={automatizarValoresACobrar} className="btn-primario">
            Automatizar Receitas (Mês Anterior)
          </button>
          <p className="info-text">
            ℹ️ Processa agendamentos do mês anterior e lança como receita com vencimento no 5º dia útil do mês atual
          </p>
        </div>

        <div className="tab-content">
          <h3>📂 Gerenciar Categorias</h3>
          <div className="categoria-form">
            <input
              type="text"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && adicionarCategoria()}
              placeholder="Nome da nova categoria"
              className="input-categoria"
            />
            <button onClick={adicionarCategoria} className="btn-primario">
              <Plus size={16} /> Adicionar
            </button>
          </div>
          <div className="categorias-lista">
            {categorias.map(cat => (
              <div key={cat} className="categoria-item">
                <span>{cat}</span>
                <button onClick={() => removerCategoria(cat)} className="btn-danger-pequeno">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="tab-content">
          <h3>🔄 Lançamentos Recorrentes</h3>
          {!novaRecorrencia && (
            <button onClick={criarRecorrencia} className="btn-primario">
              <Plus size={16} /> Nova Recorrência
            </button>
          )}
          {novaRecorrencia && (
            <div className="recorrencia-form">
              <div className="form-row">
                <div className="form-grupo">
                  <label>Tipo:</label>
                  <select value={novaRecorrencia.tipo} onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, tipo: e.target.value })}>
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                  </select>
                </div>
                <div className="form-grupo">
                  <label>Frequência:</label>
                  <select value={novaRecorrencia.frequencia} onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, frequencia: e.target.value })}>
                    <option value="SEMANAL">Semanal</option>
                    <option value="QUINZENAL">Quinzenal</option>
                    <option value="MENSAL">Mensal</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-grupo">
                  <label>Categoria:</label>
                  <select value={novaRecorrencia.categoria} onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, categoria: e.target.value })}>
                    {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-grupo">
                  <label>Valor:</label>
                  <input type="number" value={novaRecorrencia.valor} onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, valor: e.target.value })} step="0.01" />
                </div>
              </div>
              <div className="form-grupo">
                <label>Descrição:</label>
                <input type="text" value={novaRecorrencia.descricao} onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, descricao: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-grupo">
                  <label>Data Início:</label>
                  <input type="date" value={novaRecorrencia.dataInicio} onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, dataInicio: e.target.value })} />
                </div>
                <div className="form-grupo">
                  <label>Data Fim (opcional):</label>
                  <input type="date" value={novaRecorrencia.dataFim} onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, dataFim: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button onClick={salvarRecorrencia} className="btn-sucesso">Salvar</button>
                <button onClick={() => setNovaRecorrencia(null)} className="btn-cancelar">Cancelar</button>
              </div>
            </div>
          )}
          <div className="recorrencias-lista">
            <h4>Recorrências Ativas:</h4>
            {recorrencias.length === 0 ? (
              <p className="sem-dados">Nenhuma recorrência configurada</p>
            ) : (
              recorrencias.map(rec => (
                <div key={rec.id} className="recorrencia-item">
                  <div>
                    <strong>{rec.descricao}</strong>
                    <p>{rec.tipo} - {rec.frequencia} - R$ {parseFloat(rec.valor).toFixed(2)}</p>
                    <p className="texto-pequeno">{rec.dataInicio} até {rec.dataFim || 'sem data final'}</p>
                  </div>
                  <button onClick={() => deletarRecorrencia(rec.id)} className="btn-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fluxo de Caixa */}
      <div className="fluxo-filtrado">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>📊 Fluxo de Caixa</h3>
          {!novoLancamento && (
            <button onClick={criarLancamento} className="btn-primario">
              <Plus size={16} /> Novo Lançamento
            </button>
          )}
        </div>

        {novoLancamento && (
          <div className="recorrencia-form" style={{ marginBottom: '1rem' }}>
            <h4>{editandoLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</h4>
            <div className="form-row">
              <div className="form-grupo">
                <label>Data:</label>
                <input type="date" value={novoLancamento.data} onChange={(e) => setNovoLancamento({ ...novoLancamento, data: e.target.value })} />
              </div>
              <div className="form-grupo">
                <label>Tipo:</label>
                <select value={novoLancamento.tipo} onChange={(e) => setNovoLancamento({ ...novoLancamento, tipo: e.target.value })}>
                  <option value="RECEITA">Receita</option>
                  <option value="DESPESA">Despesa</option>
                </select>
              </div>
              <div className="form-grupo">
                <label>Categoria:</label>
                <select value={novoLancamento.categoria} onChange={(e) => setNovoLancamento({ ...novoLancamento, categoria: e.target.value })}>
                  {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-grupo">
                <label>Descrição:</label>
                <input type="text" value={novoLancamento.descricao} onChange={(e) => setNovoLancamento({ ...novoLancamento, descricao: e.target.value })} />
              </div>
              <div className="form-grupo">
                <label>Valor:</label>
                <input type="number" step="0.01" value={novoLancamento.valor} onChange={(e) => setNovoLancamento({ ...novoLancamento, valor: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button onClick={salvarLancamento} className="btn-sucesso"><Check size={14} /> Salvar</button>
              <button onClick={() => { setNovoLancamento(null); setEditandoLancamento(null); }} className="btn-cancelar"><X size={14} /> Cancelar</button>
            </div>
          </div>
        )}

        <div className="fluxo-filtros">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="filtro-select">
            <option value="">Todos os Tipos</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="filtro-select">
            <option value="">Todas as Categorias</option>
            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="date" value={filtroData.inicio} onChange={(e) => setFiltroData({ ...filtroData, inicio: e.target.value })} className="filtro-date" />
          <input type="date" value={filtroData.fim} onChange={(e) => setFiltroData({ ...filtroData, fim: e.target.value })} className="filtro-date" />
        </div>

        <div className="resumo-financeiro">
          <div className="card receita"><h4>Receitas</h4><p>R$ {totalReceitas.toFixed(2)}</p></div>
          <div className="card despesa"><h4>Despesas</h4><p>R$ {totalDespesas.toFixed(2)}</p></div>
          <div className="card saldo"><h4>Saldo</h4><p>R$ {(totalReceitas - totalDespesas).toFixed(2)}</p></div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fluxoFiltrado.map(fc => (
              <tr key={fc.id} className={fc.tipo === 'RECEITA' ? 'receita' : 'despesa'}>
                <td>{fc.data}</td>
                <td>{fc.tipo}</td>
                <td>{fc.categoria}</td>
                <td>{fc.descricao}</td>
                <td>R$ {parseFloat(fc.valor).toFixed(2)}</td>
                <td className="acoes">
                  <button onClick={() => editarLancamento(fc)} className="btn-editar"><Edit2 size={14} /></button>
                  <button onClick={() => deletarLancamento(fc.id)} className="btn-danger"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
