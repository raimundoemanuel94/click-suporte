# 🚀 Como enviar as atualizações para o GitHub

Abra o **terminal** (CMD, PowerShell ou Git Bash) na pasta do projeto e execute os 3 comandos abaixo:

```bash
# 1. Adicionar todos os arquivos modificados
git add index.html style.css script.js

# 2. Criar o commit com mensagem descritiva
git commit -m "feat: redesign premium front-end v6.0 - novo layout, CSS e JS"

# 3. Enviar para o GitHub
git push origin main
```

## O que será enviado:
- `index.html` — nova estrutura HTML completa (7 seções)
- `style.css` — design system premium separado (644 linhas)
- `script.js` — JavaScript aprimorado (256 linhas)

## Se quiser enviar TUDO (incluindo relatórios de análise):
```bash
git add .
git commit -m "feat: redesign premium + documentação do projeto"
git push origin main
```

## Se pedir usuário/senha:
Use seu **token do GitHub** como senha (não a senha da conta).
Gere em: https://github.com/settings/tokens
