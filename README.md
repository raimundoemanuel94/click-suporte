# Click Suporte - Manual de Publicação

Este projeto foi desenvolvido com foco em alta performance, visual premium e conversão direta via WhatsApp. Siga estas instruções para publicar o site na HostGator.

## Como publicar na HostGator (pasta public_html)

1. **Acesse o cPanel**: Faça login na sua conta HostGator e abra o "Gerenciador de Arquivos".
2. **Navegue até public_html**: Procure a pasta `public_html`. Se o seu domínio for o principal, é lá que os arquivos devem ficar.
3. **Limpeza**: Se houver um arquivo `default.php` ou uma pasta `cgi-bin`, você pode mantê-los, mas remova qualquer arquivo `index` antigo (como `index.php` ou `index.html` padrão da HostGator).
4. **Upload de Arquivos**: Envie os seguintes arquivos da sua pasta local `C:\laragon\www\Click suporte`:
   - `index.html` (o arquivo principal)
   - `style.css` (estilos premium)
   - `script.js` (interações e animações)
5. **Upload de Pastas**: Envie a pasta `assets` inteira (mantendo os subdiretórios `logo`, `favicon` e `icons`).
   - *Nota: o favicon atual fica em `assets/favicon/favicon.ico`.*
6. **Teste**: Acesse `clicksuporte.com` no seu navegador e verifique se tudo está carregando corretamente (especialmente no celular!).

## Dicas de Manutenção
- **Edição de Texto**: Para alterar qualquer frase, abra o `index.html` e edite o conteúdo entre as tags HTML.
- **WhatsApp**: Para mudar o número ou a mensagem, procure por `wa.me/5597991394382` no `index.html` e substitua pelo novo link.
- **Imagens**: Para adicionar novas imagens, coloque-as em `assets/logo` ou diretamente em `assets`, e atualize o caminho no HTML.

Desenvolvido por Click Suporte.
