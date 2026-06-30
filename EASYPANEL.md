# Deploy no EasyPanel

Este repositorio tem um `Dockerfile` na raiz para buildar e servir o webapp Ailiv/DevNX.

Configuracao recomendada no EasyPanel:

- Build: Dockerfile
- Dockerfile: `Dockerfile`
- Porta interna: `8080`
- Variavel `AILIV_API_URL`: URL do backend Airbyte, sem barra final
- Variavel `NGINX_RESOLVER`: DNS interno do Docker. Normalmente deixe `127.0.0.11`

Exemplo local:

```bash
docker build -t devnx-connecta-dados .
docker run --rm -p 3001:8080 --add-host=host.docker.internal:host-gateway -e AILIV_API_URL=http://host.docker.internal:8002 devnx-connecta-dados
```

O container deste repositorio entrega o frontend. Para a plataforma funcionar em producao, o backend Airbyte precisa estar rodando e acessivel pela URL configurada em `AILIV_API_URL`.
