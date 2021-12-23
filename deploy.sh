#!/usr/bin/env sh
set -e
npm run build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/KarlTaal/Chess-bot-simulator.git master:gh-pages
cd -