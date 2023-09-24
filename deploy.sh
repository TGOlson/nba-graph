#!/usr/bin/env bash

if [[ -n $(git status -s) ]]
then
  echo "[error] Commit changes before running this script"
  exit
fi

git checkout -B gh-pages

echo "Building production app bundle..."
npm run clean
npm run app:build-prod

mkdir -p deploy
cp -r dist deploy 

echo "Staging changes and pushing to gh-pages..."
git add deploy/
git commit -m 'Deploy new assets'

git push origin gh-pages -f

echo "Cleaning up..."
npm run clean

git checkout main
