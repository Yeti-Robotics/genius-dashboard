#! /bin/sh
git add .
git commit -m "[release] $1"
git push origin
git tag $1
git push origin $1