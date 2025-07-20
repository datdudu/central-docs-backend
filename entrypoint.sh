#!/bin/sh

# Espera o banco de dados ficar pronto e aplica as migrações
echo "Aguardando o banco de dados ficar pronto..."
until npx prisma migrate deploy; do
  >&2 echo "Banco de dados não está pronto ainda - esperando..."
  sleep 3
done

# Gera o Prisma Client antes de rodar o app
npx prisma generate

# Inicia a aplicação
npm run dev