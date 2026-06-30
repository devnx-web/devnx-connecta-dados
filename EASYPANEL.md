# Deploy completo no EasyPanel

Este repositorio tem dois modos de deploy:

- `docker-compose.easypanel.yml`: frontend Ailiv/DevNX + instalador Airbyte via `abctl`
- `Dockerfile`: somente o frontend

Para usar a plataforma, use o Compose.

## EasyPanel

Crie o app como Docker Compose:

- Compose file: `docker-compose.easypanel.yml`
- Dominio do frontend: `condados.devnx.com.br`
- Porta do frontend: `8080`
- Se aparecer 502, edite o dominio e vincule ao container/servico `frontend` na porta `8080`
- O container do frontend tambem fica nomeado como `projetos_devnx-connecta-dados`

Variaveis recomendadas:

```env
AILIV_API_URL=http://172.17.0.1:8002
NGINX_RESOLVER=127.0.0.11
AIRBYTE_PORT=8002
AIRBYTE_EMAIL=admin@devnx.com.br
AIRBYTE_PASSWORD=change-me-now
AIRBYTE_LOW_RESOURCE_MODE=false
```

Troque `AIRBYTE_EMAIL` e `AIRBYTE_PASSWORD` antes de abrir em producao.

O servico `airbyte` usa `abctl` e monta `/var/run/docker.sock` para criar o cluster Airbyte no Docker host. Na primeira subida, a instalacao pode demorar bastante porque o Airbyte baixa imagens e sobe Kubernetes local.

## Local

```bash
docker compose -f docker-compose.easypanel.yml --env-file .env.easypanel.example up -d
```

## Observacoes

- Airbyte nao e um container unico. O `abctl` instala Airbyte em um cluster Kubernetes local dentro do Docker.
- Se `AIRBYTE_LOW_RESOURCE_MODE=true`, o Airbyte reduz consumo, mas o Connector Builder fica indisponivel.
- Se quiser expor tambem o Airbyte nativo, use outro dominio e configure `AIRBYTE_HOST`.
