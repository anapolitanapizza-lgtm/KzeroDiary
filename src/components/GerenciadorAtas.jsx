import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export const GerenciadorAtas = ({ atas, setAtas, clientes, profissionais }) => {
  const [novaAta, setNovaAta] = useState(null);
  const [editandoAta, setEditandoAta] = useState(null);
  const [expandidas, setExpandidas] = useState({});
  const [filtroCliente, setFiltroCliente] = useState('');

  const criarAta = () => {
    setNovaAta({
      id: Date.now(),
      data: new Date().toISOString().split('T')[0],
      hora: '09:00',
      horaFim: '10:00',
      local: '',
      clienteId: '',
      pautas: [],
      emailsDestinatarios: ''
    });
  };

  const adicionarPauta = () => {
    if (!novaAta) return;
    const novasPautas = [...(novaAta.pautas || []), {
      id: Date.now(),
      titulo: '',
      deliberacao: '',
      responsaveis: '',
      prazo: ''
    }];
    setNovaAta({ ...novaAta, pautas: novasPautas });
  };

  const atualizarPauta = (pautaId, campo, valor) => {
    if (!novaAta) return;
    const pautasAtualizadas = (novaAta.pautas || []).map(p => 
      p.id === pautaId ? { ...p, [campo]: valor } : p
    );
    setNovaAta({ ...novaAta, pautas: pautasAtualizadas });
  };

  const removerPauta = (pautaId) => {
    if (!novaAta) return;
    const pautasAtualizadas = (novaAta.pautas || []).filter(p => p.id !== pautaId);
    setNovaAta({ ...novaAta, pautas: pautasAtualizadas });
  };

  const salvarAta = () => {
    if (!novaAta) return;
    const atasAtualizadas = editandoAta 
      ? atas.map(a => a.id === editandoAta.id ? novaAta : a)
      : [...atas, novaAta];
    setAtas(atasAtualizadas);
    setNovaAta(null);
    setEditandoAta(null);
  };

  const editarAta = (ata) => {
    setNovaAta({ ...ata });
    setEditandoAta(ata);
  };

  const deletarAta = (id) => {
    setAtas(atas.filter(a => a.id !== id));
  };

  const atasFiltradas = filtroCliente 
    ? atas.filter(a => a.clienteId === filtroCliente)
    : atas;

  const toggleExpandir = (ataId) => {
    setExpandidas(prev => ({
      ...prev,
      [ataId]: !prev[ataId]
    }));
  };

  return (
    <div className="gerenciador-atas">
      {/* Filtros e Botão Nova Ata */}
      <div className="atas-header">
        <div className="atas-filtros">
          <label>Filtrar por Cliente:</label>
          <select 
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todas as Atas</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        
        {!novaAta && (
          <button onClick={criarAta} className="btn-primario">
            <Plus size={18} /> Nova Ata
          </button>
        )}
      </div>

      {/* Formulário Nova/Editar Ata */}
      {novaAta && (
        <div className="ata-form">
          <h3>{editandoAta ? 'Editar Ata' : 'Nova Ata'}</h3>
          
          <div className="form-row">
            <div className="form-grupo">
              <label>Data:</label>
              <input 
                type="date"
                value={novaAta.data}
                onChange={(e) => setNovaAta({ ...novaAta, data: e.target.value })}
              />
            </div>
            
            <div className="form-grupo">
              <label>Hora Início:</label>
              <input 
                type="time"
                value={novaAta.hora}
                onChange={(e) => setNovaAta({ ...novaAta, hora: e.target.value })}
              />
            </div>

            <div className="form-grupo">
              <label>Hora Fim:</label>
              <input 
                type="time"
                value={novaAta.horaFim || ''}
                onChange={(e) => setNovaAta({ ...novaAta, horaFim: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-grupo">
              <label>Local:</label>
              <input 
                type="text"
                value={novaAta.local}
                onChange={(e) => setNovaAta({ ...novaAta, local: e.target.value })}
                placeholder="Ex: Sala de Reuniões"
              />
            </div>

            <div className="form-grupo">
              <label>Cliente:</label>
              <select 
                value={novaAta.clienteId}
                onChange={(e) => setNovaAta({ ...novaAta, clienteId: e.target.value })}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pautas */}
          <div className="atas-pautas">
            <div className="pautas-header">
              <h4>Pautas e Deliberações</h4>
              <button onClick={adicionarPauta} className="btn-secundario">
                <Plus size={16} /> Adicionar Pauta
              </button>
            </div>

            {(novaAta.pautas || []).map(pauta => (
              <div key={pauta.id} className="pauta-item">
                <div className="pauta-form-grupo">
                  <label>Pauta:</label>
                  <input 
                    type="text"
                    value={pauta.titulo}
                    onChange={(e) => atualizarPauta(pauta.id, 'titulo', e.target.value)}
                    placeholder="Descrição da pauta"
                  />
                </div>

                <div className="pauta-form-grupo">
                  <label>Deliberação:</label>
                  <textarea 
                    value={pauta.deliberacao}
                    onChange={(e) => atualizarPauta(pauta.id, 'deliberacao', e.target.value)}
                    placeholder="Decisão tomada"
                    rows="2"
                  />
                </div>

                <div className="pauta-row">
                  <div className="pauta-form-grupo">
                    <label>Responsável(is):</label>
                    <input 
                      type="text"
                      value={pauta.responsaveis}
                      onChange={(e) => atualizarPauta(pauta.id, 'responsaveis', e.target.value)}
                      placeholder="Nomes dos responsáveis"
                    />
                  </div>

                  <div className="pauta-form-grupo">
                    <label>Prazo:</label>
                    <input 
                      type="date"
                      value={pauta.prazo}
                      onChange={(e) => atualizarPauta(pauta.id, 'prazo', e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={() => removerPauta(pauta.id)}
                    className="btn-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-grupo">
            <label>Emails Destinatários:</label>
            <input 
              type="text"
              value={novaAta.emailsDestinatarios}
              onChange={(e) => setNovaAta({ ...novaAta, emailsDestinatarios: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
            />
          </div>

          <div className="form-actions">
            <button onClick={salvarAta} className="btn-sucesso">Salvar Ata</button>
            <button 
              onClick={() => {
                setNovaAta(null);
                setEditandoAta(null);
              }}
              className="btn-cancelar"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Atas */}
      <div className="atas-lista">
        {atasFiltradas.length === 0 ? (
          <p className="sem-dados">Nenhuma ata registrada</p>
        ) : (
          atasFiltradas.map(ata => {
            const cliente = clientes.find(c => c.id == ata.clienteId);
            const isExpandida = expandidas[ata.id];
            
            return (
              <div key={ata.id} className="ata-card">
                <div 
                  className="ata-titulo"
                  onClick={() => toggleExpandir(ata.id)}
                >
                  <div>
                    <h4>{cliente?.nome || 'Cliente Desconhecido'}</h4>
                    <p className="ata-data">{ata.data} às {ata.hora} - {ata.local}</p>
                  </div>
                  <button className="btn-expandir">
                    {isExpandida ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {isExpandida && (
                  <div className="ata-conteudo">
                    <div className="pautas-resumo">
                      <h5>Pautas e Deliberações:</h5>
                      {(ata.pautas || []).map((pauta, idx) => (
                        <div key={pauta.id} className="pauta-resumo">
                          <strong>{idx + 1}. {pauta.titulo}</strong>
                          <p><strong>Deliberação:</strong> {pauta.deliberacao}</p>
                          <p><strong>Responsável(is):</strong> {pauta.responsaveis}</p>
                          {pauta.prazo && <p><strong>Prazo:</strong> {pauta.prazo}</p>}
                        </div>
                      ))}
                    </div>

                    <div className="ata-acoes">
                      <button 
                        onClick={() => editarAta(ata)}
                        className="btn-editar"
                      >
                        <Edit2 size={16} /> Editar
                      </button>
                      <button 
                        onClick={() => deletarAta(ata.id)}
                        className="btn-danger"
                      >
                        <Trash2 size={16} /> Deletar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
