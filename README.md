# auther

## Dev

```bash
# Config env variables
cp .env.sample .env

pnpm start:dev
```

## Deploy

### Github/Gitea Actions

Set following secrets&variables in project config page:

#### Secrets

https://project_url/settings/secrets/actions

- ENV_FILE (.env file contents)
- REGISTRY_TOKEN (optional)
- HOST, HOST_USERNAME, HOST_KEY (PRIVATE KEY file contents)

#### Variables (all is optional)

https://project_url/settings/variables/actions

- APP_NAME, APP_PORT
- REGISTRY

### Docker

On dev machine:

```bash
# Config env variables
cp .env.sample .env.production

# Build and push
sh -x build.sh
```

On server:

```bash
# Pull and run
sh -x run.sh
```

You could find out the variables avaliable in these files.
