# La Chicharra Super Express — sitio web

Cada cambio que se sube a la rama `main` se publica automáticamente en https://lachicharra.mx
(GitHub Actions → FTP a cPanel, ver `.github/workflows/deploy.yml`).

La contraseña FTP vive en **Settings → Secrets and variables → Actions → `FTP_PASSWORD`**.
