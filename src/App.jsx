import React, { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, FileText, Menu, Home, Download, Moon, Sun, Settings, BarChart3 } from 'lucide-react';
import './App.css';
import backupData from './data/backup.json';
import { calcularMetricas, exportToExcel, exportToCSV } from './utils/exportUtils';
import { Calendario } from './components/Calendario';
import { GerenciadorAtas } from './components/GerenciadorAtas';
import { AnotacoesReembolsos } from './components/AnotacoesReembolsos';
import { FinanceiroAvancado } from './components/FinanceiroAvancado';
import { GerenciadorAgendamentos } from './components/GerenciadorAgendamentos';
import logoKzero from './assets/kzero-logo.png';

// Para funcionar em subpasta do GitHub Pages
const BASENAME = process.env.PUBLIC_URL || '';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState(backupData.dados);
  const [metricas, setMetricas] = useState({});

  const [profissionais] = useState(['Bianca', 'Janaína', 'Consultor 1', 'Consultor 2']);

  useEffect(() => {
    const savedData = localStorage.getItem('kzerodiary_data');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
    
    const savedDarkMode = localStorage.getItem('kzerodiary_darkmode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    setMetricas(calcularMetricas(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('kzerodiary_darkmode', JSON.stringify(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const setClientes = (novosDados) => {
    setData({ ...data, clientes: novosDados });
    localStorage.setItem('kzerodiary_data', JSON.stringify({ ...data, clientes: novosDados }));
  };

  const setAgendamentos = (novosDados) => {
    setData({ ...data, agendamentos: novosDados });
    localStorage.setItem('kzerodiary_data', JSON.stringify({ ...data, agendamentos: novosDados }));
  };

  const setFluxoCaixa = (novosDados) => {
    setData({ ...data, fluxoCaixa: novosDados });
    localStorage.setItem('kzerodiary_data', JSON.stringify({ ...data, fluxoCaixa: novosDados }));
  };

  const setAnotacoes = (novosDados) => {
    setData({ ...data, anotacoes: novosDados });
    localStorage.setItem('kzerodiary_data', JSON.stringify({ ...data, anotacoes: novosDados }));
  };

  const setReembolsos = (novosDados) => {
    setData({ ...data, reembolsos: novosDados });
    localStorage.setItem('kzerodiary_data', JSON.stringify({ ...data, reembolsos: novosDados }));
  };

  const setAtas = (novosDados) => {
    setData({ ...data, atas: novosDados });
    localStorage.setItem('kzerodiary_data', JSON.stringify({ ...data, atas: novosDados }));
  };

  const exportData = () => {
    const backup = {
      versao: '2.0',
      geradoEm: new Date().toISOString(),
      dados: data
    };
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KzeroDiary_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getDashboardStats = () => {
    const totalClientes = data.clientes.length;
    const totalAgendamentos = data.agendamentos.length;
    const totalFaturamento = metricas.totalFaturamento || 0;
    const saldoCaixa = metricas.saldoLiquido || 0;

    return { totalClientes, totalAgendamentos, totalFaturamento, saldoCaixa };
  };

  const stats = getDashboardStats();

  return (
    <div className="app-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src={logoKzero} alt="Kzero" className="logo-img" style={{ height: 40 }} />
          <button 
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${currentPage === 'calendario' ? 'active' : ''}`}
            onClick={() => setCurrentPage('calendario')}
          >
            <Calendar size={20} />
            <span>Calendário</span>
          </button>
          <button 
            className={`nav-item ${currentPage === 'agendamentos' ? 'active' : ''}`}
            onClick={() => setCurrentPage('agendamentos')}
          >
            <FileText size={20} />
            <span>Agendamentos</span>
          </button>
          <button 
            className={`nav-item ${currentPage === 'atas' ? 'active' : ''}`}
            onClick={() => setCurrentPage('atas')}
          >
            <FileText size={20} />
            <span>Atas</span>
          </button>
          <button 
            className={`nav-item ${currentPage === 'anotacoes' ? 'active' : ''}`}
            onClick={() => setCurrentPage('anotacoes')}
          >
            <FileText size={20} />
            <span>Anotações</span>
          </button>
          <button 
            className={`nav-item ${currentPage === 'financeiro' ? 'active' : ''}`}
            onClick={() => setCurrentPage('financeiro')}
          >
            <TrendingUp size={20} />
            <span>Financeiro</span>
          </button>
          <button 
            className={`nav-item ${currentPage === 'relatorios' ? 'active' : ''}`}
            onClick={() => setCurrentPage('relatorios')}
          >
            <BarChart3 size={20} />
            <span>Relatórios</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn-tema"
            onClick={() => setDarkMode(!darkMode)}
            title="Alternar Tema"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn-export" onClick={exportData}>
            <Download size={16} /> Exportar
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="app-header">
          <h2>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h2>
          <div className="header-info">
            <span>v2.0</span>
          </div>
        </header>

        <div className="content">
          {currentPage === 'dashboard' && (
            <Dashboard stats={stats} data={data} metricas={metricas} logoKzero={logoKzero} />
          )}
          {currentPage === 'calendario' && (
            <Calendario agendamentos={data.agendamentos} clientes={data.clientes} profissionais={profissionais} />
          )}
          {currentPage === 'agendamentos' && (
            <GerenciadorAgendamentos 
              agendamentos={data.agendamentos}
              setAgendamentos={setAgendamentos}
              clientes={data.clientes}
              profissionais={profissionais}
            />
          )}
          {currentPage === 'atas' && (
            <GerenciadorAtas 
              atas={data.atas}
              setAtas={setAtas}
              clientes={data.clientes}
              profissionais={profissionais}
            />
          )}
          {currentPage === 'anotacoes' && (
            <AnotacoesReembolsos 
              anotacoes={data.anotacoes}
              setAnotacoes={setAnotacoes}
              reembolsos={data.reembolsos}
              setReembolsos={setReembolsos}
              clientes={data.clientes}
            />
          )}
          {currentPage === 'financeiro' && (
            <FinanceiroAvancado 
              fluxoCaixa={data.fluxoCaixa}
              setFluxoCaixa={setFluxoCaixa}
              agendamentos={data.agendamentos}
              clientes={data.clientes}
            />
          )}
          {currentPage === 'relatorios' && (
            <RelatoriosAvancados data={data} metricas={metricas} logoKzero={logoKzero} />
          )}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ stats, data, metricas, logoKzero }) {
  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon clients">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <h3>Clientes</h3>
            <p className="stat-number">{stats.totalClientes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon agendamentos">
            <Calendar size={32} />
          </div>
          <div className="stat-content">
            <h3>Agendamentos</h3>
            <p className="stat-number">{stats.totalAgendamentos}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon faturamento">
            <TrendingUp size={32} />
          </div>
          <div className="stat-content">
            <h3>Faturamento</h3>
            <p className="stat-number">R$ {stats.totalFaturamento.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon saldo">
            <TrendingUp size={32} />
          </div>
          <div className="stat-content">
            <h3>Saldo</h3>
            <p className="stat-number">R$ {stats.saldoCaixa.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Últimos Agendamentos</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Profissional</th>
              <th>Horas</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.agendamentos.slice(0, 5).map((ag) => {
              const cliente = data.clientes.find(c => c.id == ag.cliente);
              return (
                <tr key={ag.id}>
                  <td>{ag.data}</td>
                  <td>{cliente?.nome || 'N/A'}</td>
                  <td>{ag.tipo || 'Consultoria'}</td>
                  <td>{ag.profissional || '-'}</td>
                  <td>{ag.horas}h</td>
                  <td>R$ {parseFloat(ag.valor).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RelatoriosAvancados({ data, metricas, logoKzero }) {
  return (
    <div className="relatorios-avancados">
      <div className="relatorio-header">
        <img src={logoKzero} alt="Kzero" style={{ height: 50, marginBottom: '1rem' }} />
        <h2>Relatório de Gestão</h2>
        <p>{new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div className="relatorios-grid">
        <div className="relatorio-card">
          <h4>📊 Faturamento por Cliente</h4>
          <table className="relatorio-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Valor</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metricas.faturamentoPorCliente || {}).map(([cliente, valor]) => (
                <tr key={cliente}>
                  <td>{cliente}</td>
                  <td>R$ {valor.toFixed(2)}</td>
                  <td>{metricas.totalFaturamento ? ((valor / metricas.totalFaturamento) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="relatorio-card">
          <h4>⏱️ Horas Trabalhadas por Cliente</h4>
          <table className="relatorio-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Horas</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metricas.horasPorCliente || {}).map(([cliente, horas]) => (
                <tr key={cliente}>
                  <td>{cliente}</td>
                  <td>{horas.toFixed(1)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
