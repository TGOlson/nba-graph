#!/usr/bin/env bash

if [[ -n $(git status -s) ]]
then
  echo "[error] Commit changes before running this script"
  exit
fi

git checkout -b gh-pages

echo "Building production app bundle..."
npm run clean
npm run app:build-prod

mkdir assets/
cp dist/app.* assets/

echo "Staging changes and pushing to gh-pages..."
git add assets/
git commit -m 'Deploy new assets'
git push origin gh-pages

echo "Cleaning up..."
npm run clean
git branch -D gh-pages

git checkout main
