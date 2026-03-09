// utils/exportUtils.js
import * as XLSX from 'xlsx';

/**
 * Exportar dados para Excel
 */
export const exportToExcel = (data, fileName = 'relatorio.xlsx') => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Aba 1: Clientes
    if (data.clientes && data.clientes.length > 0) {
      const clientesData = data.clientes.map(c => ({
        'Nome': c.nome,
        'Valor/Hora': c.valorHora,
        'Responsável': c.responsavelFinanceiro,
        'Email': c.emailFinanceiro,
      }));
      const ws1 = XLSX.utils.json_to_sheet(clientesData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Clientes');
    }
    
    // Aba 2: Agendamentos
    if (data.agendamentos && data.agendamentos.length > 0) {
      const agendamentosData = data.agendamentos.map(a => ({
        'Data': a.data,
        'Hora Início': a.horaInicio,
        'Hora Fim': a.horaFim,
        'Descrição': a.descricao,
        'Horas': a.horas,
        'Valor': a.valor,
      }));
      const ws2 = XLSX.utils.json_to_sheet(agendamentosData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Agendamentos');
    }
    
    // Aba 3: Fluxo de Caixa
    if (data.fluxoCaixa && data.fluxoCaixa.length > 0) {
      const fluxoData = data.fluxoCaixa.map(f => ({
        'Data': f.data,
        'Tipo': f.tipo,
        'Categoria': f.categoria,
        'Descrição': f.descricao,
        'Valor': f.valor,
      }));
      const ws3 = XLSX.utils.json_to_sheet(fluxoData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Fluxo de Caixa');
    }
    
    // Salvar arquivo
    XLSX.writeFile(wb, fileName);
    return true;
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    return false;
  }
};

/**
 * Exportar dados para CSV
 */
export const exportToCSV = (data, fileName = 'relatorio.csv') => {
  try {
    let csv = '';
    
    // Adicionar todos os agendamentos em CSV
    if (data.agendamentos && data.agendamentos.length > 0) {
      csv += 'Data,Hora Início,Hora Fim,Descrição,Horas,Valor\n';
      data.agendamentos.forEach(a => {
        csv += `${a.data},${a.horaInicio},${a.horaFim},"${a.descricao}",${a.horas},${a.valor}\n`;
      });
    }
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    return true;
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    return false;
  }
};

/**
 * Cálculos financeiros
 */
export const calcularMetricas = (data) => {
  const agendamentos = data.agendamentos || [];
  const fluxoCaixa = data.fluxoCaixa || [];
  const clientes = data.clientes || [];
  
  // Totais
  const totalFaturamento = agendamentos.reduce((sum, a) => sum + parseFloat(a.valor || 0), 0);
  const totalHoras = agendamentos.reduce((sum, a) => sum + parseFloat(a.horas || 0), 0);
  const totalReceitas = fluxoCaixa
    .filter(f => f.tipo === 'RECEITA')
    .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);
  const totalDespesas = fluxoCaixa
    .filter(f => f.tipo === 'DESPESA')
    .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);
  
  // Médias
  const mediaHorasAgendamento = agendamentos.length > 0 ? totalHoras / agendamentos.length : 0;
  const mediaValorAgendamento = agendamentos.length > 0 ? totalFaturamento / agendamentos.length : 0;
  
  // Por cliente
  const faturamentoPorCliente = {};
  const horasPorCliente = {};
  
  agendamentos.forEach(a => {
    const cliente = clientes.find(c => c.id == a.cliente);
    const nomeCliente = cliente ? cliente.nome : 'Desconhecido';
    
    faturamentoPorCliente[nomeCliente] = (faturamentoPorCliente[nomeCliente] || 0) + parseFloat(a.valor || 0);
    horasPorCliente[nomeCliente] = (horasPorCliente[nomeCliente] || 0) + parseFloat(a.horas || 0);
  });
  
  // Cliente mais lucrativo
  let clienteMaisLucrativo = null;
  let maiorFaturamento = 0;
  Object.entries(faturamentoPorCliente).forEach(([cliente, valor]) => {
    if (valor > maiorFaturamento) {
      maiorFaturamento = valor;
      clienteMaisLucrativo = cliente;
    }
  });
  
  return {
    totalFaturamento,
    totalHoras,
    totalReceitas,
    totalDespesas,
    mediaHorasAgendamento,
    mediaValorAgendamento,
    faturamentoPorCliente,
    horasPorCliente,
    clienteMaisLucrativo,
    maiorFaturamento,
    saldoLiquido: totalReceitas - totalDespesas,
    margemLucrativa: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0,
  };
};

/**
 * Filtrar dados
 */
export const filtrarAgendamentos = (agendamentos, filtros) => {
  let resultado = [...agendamentos];
  
  if (filtros.dataInicio) {
    resultado = resultado.filter(a => new Date(a.data) >= new Date(filtros.dataInicio));
  }
  
  if (filtros.dataFim) {
    resultado = resultado.filter(a => new Date(a.data) <= new Date(filtros.dataFim));
  }
  
  if (filtros.cliente) {
    resultado = resultado.filter(a => a.cliente == filtros.cliente);
  }
  
  if (filtros.descricao) {
    resultado = resultado.filter(a => a.descricao.toLowerCase().includes(filtros.descricao.toLowerCase()));
  }
  
  return resultado;
};

/**
 * Buscar clientes
 */
export const buscarClientes = (clientes, termo) => {
  if (!termo) return clientes;
  
  const termoLower = termo.toLowerCase();
  return clientes.filter(c => 
    c.nome.toLowerCase().includes(termoLower) ||
    c.responsavelFinanceiro.toLowerCase().includes(termoLower)
  );
};
