# Deploy no EasyPanel

Este repositorio tem um `Dockerfile` na raiz para buildar e servir o webapp Ailiv/DevNX.

Configuracao recomendada no EasyPanel:

- Build: Dockerfile
- Dockerfile: `Dockerfile`
- Porta interna: `8080`
- Variavel `AILIV_API_URL`: URL do backend Airbyte, sem barra final

Exemplo local:

```bash
docker build -t devnx-connecta-dados .
docker run --rm -p 3001:8080 -e AILIV_API_URL=http://host.docker.internal:8002 devnx-connecta-dados
```

O container deste repositorio entrega o frontend. Para a plataforma funcionar em producao, o backend Airbyte precisa estar rodando e acessivel pela URL configurada em `AILIV_API_URL`.
