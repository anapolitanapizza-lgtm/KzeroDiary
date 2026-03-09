import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';

export const FinanceiroAvancado = ({ fluxoCaixa, setFluxoCaixa, agendamentos, clientes }) => {
  const [novoLancamento, setNovoLancamento] = useState(null);
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
  const [filtroData, setFiltroData] = useState({
    inicio: '',
    fim: ''
  });

  // Salvar categorias no localStorage
  useEffect(() => {
    localStorage.setItem('kzerodiary_categorias', JSON.stringify(categorias));
  }, [categorias]);

  // Salvar recorrências no localStorage
  useEffect(() => {
    localStorage.setItem('kzerodiary_recorrencias', JSON.stringify(recorrencias));
  }, [recorrencias]);

  // Gerar lançamentos recorrentes automaticamente
  useEffect(() => {
    const processarRecorrencias = () => {
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

        // Se a próxima data é hoje ou antes, criar lançamento
        if (proximaData <= hoje && (!rec.dataFim || proximaData <= new Date(rec.dataFim))) {
          lancamentosAProcessar.push({
            ...rec,
            proximaData: proximaData.toISOString().split('T')[0]
          });
        }
      });

      // Criar os lançamentos
      lancamentosAProcessar.forEach(rec => {
        const novoLancamento = {
          id: Date.now(),
          data: rec.proximaData,
          tipo: rec.tipo,
          classificacao: rec.classificacao,
          categoria: rec.categoria,
          descricao: rec.descricao,
          valor: rec.valor,
          clienteId: rec.clienteId || '',
          recorrenteId: rec.id
        };

        setFluxoCaixa(prev => [...prev, novoLancamento]);

        // Atualizar data do último lançamento
        setRecorrencias(prev => prev.map(r => 
          r.id === rec.id 
            ? { ...r, ultimoLancamento: rec.proximaData }
            : r
        ));
      });
    };

    processarRecorrencias();
  }, []);

  // Automatizar lançamentos de valores a cobrar
  const automatizarValoresACobrar = () => {
    const hoje = new Date();
    const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Buscar agendamentos do mês anterior que ainda não foram lançados como receita
    const agendamentosParaCobrar = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data);
      const ehMesAnterior = dataAgendamento >= mesAnterior && dataAgendamento < mesAtual;
      const jaFoiLancado = fluxoCaixa.some(f => 
        f.agendamentoId === a.id && f.tipo === 'RECEITA'
      );
      return ehMesAnterior && !jaFoiLancado && a.tipo !== 'PESSOAL';
    });

    // Calcular 5º dia útil do mês atual
    let diaUtil = 0;
    let data = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    while (diaUtil < 5) {
      const diaSemana = data.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) { // Não é fim de semana
        diaUtil++;
      }
      if (diaUtil < 5) {
        data.setDate(data.getDate() + 1);
      }
    }

    const dataVencimento = data.toISOString().split('T')[0];

    // Agrupar por cliente e criar lançamentos
    const lançamentosPorCliente = {};
    
    agendamentosParaCobrar.forEach(a => {
      if (!lançamentosPorCliente[a.cliente]) {
        lançamentosPorCliente[a.cliente] = 0;
      }
      lançamentosPorCliente[a.cliente] += parseFloat(a.valor || 0);
    });

    // Criar lançamentos no fluxo de caixa
    Object.entries(lançamentosPorCliente).forEach(([clienteId, valor]) => {
      const cliente = clientes.find(c => c.id == clienteId);
      
      setFluxoCaixa(prev => [...prev, {
        id: Date.now() + Math.random(),
        data: dataVencimento,
        tipo: 'RECEITA',
        classificacao: 'ATIVO',
        categoria: 'Banco',
        descricao: `Recebimento ${cliente?.nome || 'Cliente Desconhecido'} - Mês anterior`,
        valor: valor.toFixed(2),
        clienteId: clienteId
      }]);
    });

    alert(`${Object.keys(lançamentosPorCliente).length} lançamentos automatizados com vencimento em ${dataVencimento}`);
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
      id: Date.now(),
      tipo: 'DESPESA',
      classificacao: 'PASSIVO',
      categoria: categorias[0] || '',
      descricao: '',
      valor: '',
      frequencia: 'MENSAL',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: '',
      ultimoLancamento: null
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
            ℹ️ Vai processar agendamentos do mês anterior e lançar como receita com vencimento no 5º dia útil do mês atual
          </p>
        </div>

        <div className="tab-content">
          <h3>📂 Gerenciar Categorias</h3>
          
          <div className="categoria-form">
            <input 
              type="text"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
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
                <button 
                  onClick={() => removerCategoria(cat)}
                  className="btn-danger-pequeno"
                >
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
                  <select 
                    value={novaRecorrencia.tipo}
                    onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, tipo: e.target.value })}
                  >
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Frequência:</label>
                  <select 
                    value={novaRecorrencia.frequencia}
                    onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, frequencia: e.target.value })}
                  >
                    <option value="SEMANAL">Semanal</option>
                    <option value="QUINZENAL">Quinzenal</option>
                    <option value="MENSAL">Mensal</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-grupo">
                  <label>Categoria:</label>
                  <select 
                    value={novaRecorrencia.categoria}
                    onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, categoria: e.target.value })}
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grupo">
                  <label>Valor:</label>
                  <input 
                    type="number"
                    value={novaRecorrencia.valor}
                    onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, valor: e.target.value })}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label>Descrição:</label>
                <input 
                  type="text"
                  value={novaRecorrencia.descricao}
                  onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, descricao: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-grupo">
                  <label>Data Início:</label>
                  <input 
                    type="date"
                    value={novaRecorrencia.dataInicio}
                    onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, dataInicio: e.target.value })}
                  />
                </div>

                <div className="form-grupo">
                  <label>Data Fim (opcional):</label>
                  <input 
                    type="date"
                    value={novaRecorrencia.dataFim}
                    onChange={(e) => setNovaRecorrencia({ ...novaRecorrencia, dataFim: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button onClick={salvarRecorrencia} className="btn-sucesso">Salvar</button>
                <button 
                  onClick={() => setNovaRecorrencia(null)}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
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
                  <button 
                    onClick={() => deletarRecorrencia(rec.id)}
                    className="btn-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fluxo de Caixa com Filtros */}
      <div className="fluxo-filtrado">
        <h3>📊 Fluxo de Caixa</h3>
        
        <div className="fluxo-filtros">
          <select 
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todos os Tipos</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>

          <select 
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todas as Categorias</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input 
            type="date"
            value={filtroData.inicio}
            onChange={(e) => setFiltroData({ ...filtroData, inicio: e.target.value })}
            className="filtro-date"
            placeholder="Data Início"
          />

          <input 
            type="date"
            value={filtroData.fim}
            onChange={(e) => setFiltroData({ ...filtroData, fim: e.target.value })}
            className="filtro-date"
            placeholder="Data Fim"
          />
        </div>

        <div className="resumo-financeiro">
          <div className="card receita">
            <h4>Receitas</h4>
            <p>R$ {totalReceitas.toFixed(2)}</p>
          </div>
          <div className="card despesa">
            <h4>Despesas</h4>
            <p>R$ {totalDespesas.toFixed(2)}</p>
          </div>
          <div className="card saldo">
            <h4>Saldo</h4>
            <p>R$ {(totalReceitas - totalDespesas).toFixed(2)}</p>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Valor</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
