#!/usr/bin/env bash
set -e

APP_DIR="/var/www/rwasikh/backend/Real_Estate_Matching"
git config --global --add safe.directory "$APP_DIR" || true

cd "$APP_DIR"
git pull origin main

cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
pm2 restart real-estate-api --update-env


