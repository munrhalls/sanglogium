git init
git checkout -b main
git add .
git commit -m "Initial commit"
gh repo create <repo-name> --public --source=. --remote=origin --push