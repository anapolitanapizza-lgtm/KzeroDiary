# KzeroDiary

Sistema de gestão de consultoria com controle de clientes, agendamentos, fluxo de caixa e análises financeiras.

## 📋 Funcionalidades

- **Gestão de Clientes**: Cadastro e controle de clientes com valores/hora
- **Agendamentos**: Registro de consultorias com data, hora, duração e valor
- **Fluxo de Caixa**: Controle de receitas e despesas
- **Relatórios Financeiros**: Análise de faturamento por cliente
- **Anotações e Atas**: Registro de reuniões e atividades
- **Backup/Restore**: Sistema de backup em JSON

## 🛠️ Tecnologias

- **React 18.2** - Interface de usuário
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones
- **CSS3** - Estilização

## 📦 Pré-requisitos

- Node.js 14+
- npm ou yarn

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/kzerodiary.git
cd kzerodiary
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

## 📁 Estrutura do Projeto

```
kzerodiary/
├── src/
│   ├── components/          # Componentes React
│   ├── pages/              # Páginas da aplicação
│   ├── data/               # Dados e backups
│   ├── styles/             # Estilos CSS
│   ├── App.jsx             # Componente principal
│   └── index.jsx           # Ponto de entrada
├── public/                 # Arquivos estáticos
├── package.json            # Dependências do projeto
└── README.md              # Este arquivo
```

## 💾 Funcionalidades de Backup

A aplicação permite:
- **Exportar dados**: Baixar backup em JSON
- **Importar dados**: Carregar dados de um arquivo JSON anterior
- **Persistência**: Dados salvos em localStorage

### Formato de Backup

```json
{
  "versao": "1.0",
  "geradoEm": "ISO_DATE",
  "dados": {
    "clientes": [...],
    "agendamentos": [...],
    "fluxoCaixa": [...],
    "reembolsos": [...],
    "anotacoes": [...],
    "atas": [...]
  }
}
```

## 📊 Dados de Exemplo

O projeto inclui dados de exemplo com:
- 6 clientes de consultoria
- 22 agendamentos registrados
- Fluxo de caixa com receitas e despesas
- Anotações e atas de reuniões

## 🔧 Disponibilidade dos Scripts

- `npm start` - Inicia modo desenvolvimento (porta 3000)
- `npm build` - Cria build para produção
- `npm test` - Executa testes
- `npm eject` - Ejetar configuração (irreversível)

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (opcional):

```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_VERSION=1.0.0
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit as mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💼 Autor

Kzero Consultoria

## 📞 Contato

- Email: contato@kzeroconsultoria.com.br
- Website: https://kzeroconsultoria.com.br

## 🐛 Issues e Bugs

Se encontrar um bug ou tiver uma sugestão, por favor abra uma [issue](https://github.com/seu-usuario/kzerodiary/issues).

## ⭐ Se útil, deixe uma estrela!

Se este projeto foi útil para você, considere deixar uma ⭐ no repositório.

---

**Última atualização**: Março 2026
