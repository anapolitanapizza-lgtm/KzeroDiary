import re

# Ler o arquivo
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar PUBLIC_URL após a importação do logo
content = content.replace(
    "import logoKzero from './assets/kzero-logo.png';",
    """import logoKzero from './assets/kzero-logo.png';

// Para funcionar em subpasta do GitHub Pages
const BASENAME = process.env.PUBLIC_URL || '';"""
)

# Agora atualizar as referências de imagens dinâmicas se houver
# Mas como você usa import direto, já está bom!

# Salvar
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ App.jsx corrigido!")
