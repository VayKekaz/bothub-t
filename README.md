### How to start

#### Docker compose

Requirements:

- Docker & Docker compose

```shell
cp .env.example .env  # might want to edit
docker compose up -d
```

#### Local

Requirements:

- Node.js 22+
- PostgreSQL 16 / Docker compose

```shell
corepack enable
yarn install

docker compose up database -d  # or running postgresql locally

yarn run start:dev
# OR
yarn run build && yarn run start:prod
# OR
yarn run test
```

### Usage

Openapi is located under `/docs` path. `http://localhost:3000/docs` by default.

Notable endpoints:

- `/test/create-admin` - creates test admin
