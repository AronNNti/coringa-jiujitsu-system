# Configuração do Domínio www.coringajiujitsu.com.br

Guia completo para configurar o site para rodar em `www.coringajiujitsu.com.br`.

## 🌐 Configuração do Domínio

### 1. Registrar o Domínio

Se ainda não tem o domínio registrado:
- Acesse um registrador (GoDaddy, Namecheap, RegistroBR, etc.)
- Registre `coringajiujitsu.com.br`

### 2. Configurar DNS

Após registrar o domínio, configure os DNS records para apontar para seu servidor:

**Opção A: Se usar Railway**
- Vá para o painel do Railway
- Copie o IP ou CNAME fornecido
- Configure no seu registrador:
  - `A` record: `www` → IP do Railway
  - `CNAME` record: `www` → CNAME do Railway

**Opção B: Se usar seu próprio servidor**
- Configure o IP do seu servidor nos DNS records
  - `A` record: `www` → seu_ip_do_servidor

### 3. Configurar SSL/HTTPS

**Se usar Railway:**
- Railway fornece SSL automático
- Não precisa fazer nada

**Se usar seu próprio servidor:**
- Use Let's Encrypt (gratuito)
- Instale Certbot: `sudo apt-get install certbot`
- Gere certificado: `sudo certbot certonly --standalone -d www.coringajiujitsu.com.br`

### 4. Configurar Nginx (se usar servidor próprio)

Crie um arquivo `/etc/nginx/sites-available/coringajiujitsu`:

```nginx
server {
    listen 80;
    server_name www.coringajiujitsu.com.br coringajiujitsu.com.br;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.coringajiujitsu.com.br coringajiujitsu.com.br;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/www.coringajiujitsu.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.coringajiujitsu.com.br/privkey.pem;
    
    # Proxy para Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Proxy para API
    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar o site:
```bash
sudo ln -s /etc/nginx/sites-available/coringajiujitsu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🚀 Deploy com Railway

1. Conectar repositório GitHub ao Railway
2. Configurar variáveis de ambiente
3. Adicionar domínio customizado no Railway:
   - Vá para Settings → Domains
   - Adicione `www.coringajiujitsu.com.br`
   - Configure os DNS records conforme instruído

## 🔧 Variáveis de Ambiente para Produção

Certifique-se de que estas variáveis estão configuradas:

```
NODE_ENV=production
PORT=3000

DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=3GWcUNxLYpVsCmk.root
DB_PASSWORD=sua_senha_tidb
DB_NAME=test

JWT_SECRET=sua_chave_jwt_super_secreta_aqui
SESSION_SECRET=sua_chave_session_super_secreta_aqui

BASE_URL=https://www.coringajiujitsu.com.br
```

## ✅ Testar o Site

1. Acesse `https://www.coringajiujitsu.com.br`
2. Verifique se o SSL está funcionando (cadeado verde)
3. Teste o login com um usuário de teste
4. Teste todas as funcionalidades

## 🆘 Troubleshooting

### Domínio não resolve
- Aguarde 24-48 horas para propagação de DNS
- Verifique se os DNS records estão corretos
- Use `nslookup www.coringajiujitsu.com.br` para testar

### SSL não funciona
- Verifique se o certificado está instalado
- Certifique-se de que a porta 443 está aberta
- Teste com `curl https://www.coringajiujitsu.com.br`

### Erro 502 Bad Gateway
- Verifique se o servidor Node.js está rodando
- Verifique se a porta 3000 está aberta
- Verifique os logs do Nginx: `sudo tail -f /var/log/nginx/error.log`

### Banco de dados não conecta
- Verifique as credenciais do TiDB Cloud
- Certifique-se de que o IP do servidor está autorizado no TiDB Cloud
- Teste a conexão localmente primeiro

## 📞 Suporte

Para dúvidas sobre configuração de domínio, consulte a documentação do seu registrador ou provedor de hospedagem.
