## 🔒 HTTPS Setup with Let's Encrypt (Certbot) + Nginx for Django on Azure

This guide shows how to secure your Django backend using a **free Let's Encrypt certificate** via **Certbot**, and serve it using **Nginx** on an Azure VM.

---

### ✅ 1. SSH into Your Azure VM

```bash
ssh <your-username>@<your-vm-ip>
```

---

### ✅ 2. Install and Start Nginx

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

🔍 Test in browser:
[http://nonprofit-backend.eastus.cloudapp.azure.com](http://nonprofit-backend.eastus.cloudapp.azure.com)

---

### ✅ 3. Install Certbot and the Nginx Plugin

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

### ✅ 4. Open Ports in Azure

Ensure these **inbound port rules** are open in the VM’s Network Security Group:

| Port | Protocol | Purpose             |
|------|----------|---------------------|
| 80   | TCP      | Certbot HTTP check  |
| 443  | TCP      | HTTPS access        |
| 22   | TCP      | SSH (for you)       |

---

### ✅ 5. Run Django Locally on 127.0.0.1:8000

```bash
uvicorn config.asgi:application --host 127.0.0.1 --port 8000
```

This keeps it internal — only Nginx sees it.

---

### ✅ 6. Configure Nginx Reverse Proxy to Django

Edit default site config:

```bash
sudo nano /etc/nginx/sites-available/default
```

Paste this:

```nginx
server {
    listen 80;
    server_name nonprofit-backend.eastus.cloudapp.azure.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### ✅ 7. Run Certbot to Get HTTPS

```bash
sudo certbot --nginx -d nonprofit-backend.eastus.cloudapp.azure.com
```

Certbot will:
- Get a free SSL cert
- Auto-configure Nginx
- Set up renewal cron job

---

### ✅ 8. Verify HTTPS Works

Visit:

```
https://nonprofit-backend.eastus.cloudapp.azure.com
```

✅ You should see your Django API  
✅ HTTPS with a **green lock** is active

---

### ✅ 9. Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

This verifies auto-renewal is correctly configured by Certbot.

---
