# 🚀 Guia: Como Subir KzeroDiary no GitHub

## Pré-requisitos

- Conta no GitHub (crie em https://github.com se não tiver)
- Git instalado no seu computador
- Terminal/CMD com acesso ao projeto

---

## Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha os campos:
   - **Repository name**: `kzerodiary`
   - **Description**: `Sistema de gestão de consultoria - Controle de clientes, agendamentos e fluxo de caixa`
   - **Visibility**: Selecione "Public"
   - ✅ Desmarque "Initialize this repository with..."
3. Clique em **Create repository**

---

## Passo 2: Configurar Git Localmente

Abra o terminal na pasta do projeto e execute os comandos abaixo:

### 2.1 Configurar Identidade do Git (primeira vez)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

### 2.2 Inicializar Repositório Local

```bash
cd kzerodiary
git init
git add .
git commit -m "Initial commit: Adiciona projeto KzeroDiary"
```

---

## Passo 3: Conectar com GitHub

Após criar o repositório no GitHub, você verá instruções. Execute:

### Renomear Branch (se necessário)

```bash
git branch -M main
```

### Adicionar Remote do GitHub

Substitua `seu-usuario` pelo seu username do GitHub:

```bash
git remote add origin https://github.com/seu-usuario/kzerodiary.git
```

### Fazer Push Inicial

```bash
git push -u origin main
```

Se pedir autenticação:
- **Para HTTPS**: Use seu token de acesso pessoal (https://github.com/settings/tokens)
- **Para SSH**: Configure sua chave SSH (recomendado)

---

## Passo 4: Verificar no GitHub

1. Acesse https://github.com/seu-usuario/kzerodiary
2. Verifique se os arquivos aparecem
3. Confirme se o README.md está sendo exibido

---

## 📋 Checklist de Arquivos

O repositório deve conter:

```
✅ package.json
✅ README.md
✅ LICENSE
✅ .gitignore
✅ src/data/backup.json
✅ GITHUB_SETUP.md (este arquivo)
```

---

## 🔄 Próximos Commits

Após a configuração inicial, para fazer atualizações:

```bash
# 1. Faça suas alterações nos arquivos

# 2. Stage das mudanças
git add .

# 3. Commit
git commit -m "Descrição da mudança"

# 4. Push para GitHub
git push origin main
```

---

## 🌐 Configurações GitHub (Recomendadas)

Após subir o repositório, acesse **Settings** e configure:

### 1. **General**
- ✅ Desabilitar wikis (se não usar)
- ✅ Desabilitar projects (se não usar)
- ✅ Desabilitar discussions (se não usar)

### 2. **Branches** → **Branch protection rules**
- **Branch name pattern**: `main`
- ✅ Require pull request reviews
- ✅ Dismiss stale reviews
- ✅ Include administrators

### 3. **Pages** (opcional - para publicar website)
- Source: Deploy from a branch
- Branch: `gh-pages` (requer configuração extra)

---

## 🔐 Autenticação HTTPS vs SSH

### Opção 1: HTTPS (Mais Fácil)

```bash
git remote add origin https://github.com/seu-usuario/kzerodiary.git
```

Na primeira vez, cole seu **Personal Access Token**:
1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Marque `repo` e `user`
4. Copie o token e cole no terminal

### Opção 2: SSH (Mais Seguro - Recomendado)

```bash
# Gerar chave (execute uma vez)
ssh-keygen -t ed25519 -C "seu.email@example.com"

# Adicionar ao GitHub
# 1. Copie o conteúdo de ~/.ssh/id_ed25519.pub
# 2. Acesse https://github.com/settings/keys
# 3. Clique em "New SSH key"
# 4. Cole a chave

# Usar SSH no repositório
git remote add origin git@github.com:seu-usuario/kzerodiary.git
```

---

## 🆘 Troubleshooting

### "fatal: not a git repository"
```bash
git init
```

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/seu-usuario/kzerodiary.git
```

### "Authentication failed"
- HTTPS: Regenere seu Personal Access Token
- SSH: Verifique se a chave SSH está adicionada ao GitHub

### Erro ao fazer push
```bash
# Puxar alterações remotas primeiro
git pull origin main
git push origin main
```

---

## 📚 Recursos Úteis

- [Documentação GitHub](https://docs.github.com)
- [Git Cheat Sheet](https://github.github.com/training-kit/)
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)

---

## ✨ Boas Práticas de Commits

```bash
# ✅ BOM
git commit -m "feat: adiciona autenticação de usuários"
git commit -m "fix: corrige bug na validação de datas"
git commit -m "docs: atualiza README com instruções de setup"
git commit -m "style: formata código com Prettier"

# ❌ RUIM
git commit -m "alterações"
git commit -m "fix"
git commit -m "ajustando coisas"
```

---

## 🎉 Pronto!

Seu repositório está no GitHub! Agora você pode:

- ✅ Compartilhar o link do repositório
- ✅ Colaborar com outros desenvolvedores
- ✅ Rastrear mudanças com histórico do Git
- ✅ Usar GitHub Actions para CI/CD
- ✅ Hospedar via GitHub Pages

**URL do repositório**: `https://github.com/seu-usuario/kzerodiary`

---

**Dúvidas?** Confira a documentação oficial em https://docs.github.com
