#!/bin/sh
# Garantir que o diretório de dados pertence ao user node
chown -R node:node /app/data

# Executar o comando como user node
exec su-exec node "$@"
