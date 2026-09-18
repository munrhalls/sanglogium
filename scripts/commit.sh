#!/usr/bin/env bash
# scripts/commit.sh - Git commit protocol CLI for sang-logium (Linux).
#
# Usage:
#   npm run commit
#   bash scripts/commit.sh [-n|--no-push]
#
# Implements the commit protocol: orient, classify (A-E), stage precisely,
# commit with taxonomy tag, and push to origin main automatically.

set -u

NoPush=0
case "${1:-}" in
  -n|--no-push) NoPush=1 ;;
  -h|--help)
    echo "Usage: npm run commit"
    echo "       bash scripts/commit.sh [-n|--no-push]"
    echo ""
    echo "Implements the commit protocol: orient, classify (A-E), stage precisely,"
    echo "commit with taxonomy tag, push to origin main automatically. -n skips the push."
    echo "Never deletes files or uses blanket staging (git add . / -A / -a) or git ac."
    exit 0
    ;;
esac

if [ -t 1 ]; then
  C="\033[0;36m"
  G="\033[0;32m"
  Y="\033[1;33m"
  R="\033[0;31m"
  Dg="\033[0;90m"
  N="\033[0m"
else
  C=""; G=""; Y=""; R=""; Dg=""; N=""
fi

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || { echo "not a git repo"; exit 1; }
cd "$repo_root"

confirm_yesno() {
  local prompt="$1"
  local default="$2"
  local suffix
  if [ "$default" = "y" ]; then suffix="[Y/n]"; else suffix="[y/N]"; fi
  local resp
  while true; do
    read -r -p "$prompt $suffix " resp
    [ -z "$resp" ] && resp="$default"
    resp=$(printf '%s' "$resp" | tr '[:upper:]' '[:lower:]')
    case "$resp" in
      y|yes) return 0 ;;
      n|no) return 1 ;;
    esac
  done
}

echo -e "${C}==========================================${N}"
echo -e "${C} Phase 1: Orient ${N}"
echo -e "${C}==========================================${N}"
echo "Working directory: $repo_root"
branch=$(git branch --show-current)
echo "Current branch: $branch"

mapfile -t status_lines < <(git status --no-renames --short)

declare -a staged=()
declare -a unstaged=()
declare -a untracked=()
declare -A seen=()
declare -a all=()

for line in "${status_lines[@]}"; do
  [ -z "$line" ] && continue
  marker=${line:0:2}
  path=${line:3}
  path=$(printf '%s' "$path" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  [ -z "$path" ] && continue
  if [ "$marker" = "??" ]; then
    untracked+=("$path")
  else
    x=${marker:0:1}
    y=${marker:1:1}
    [ "$x" != " " ] && [ "$x" != "?" ] && staged+=("$path")
    [ "$y" != " " ] && [ "$y" != "?" ] && unstaged+=("$path")
  fi
done

for f in "${staged[@]}" "${unstaged[@]}" "${untracked[@]}"; do
  [ -n "${seen[$f]+_}" ] && continue
  seen[$f]=1
  all+=("$f")
done

if [ ${#all[@]} -eq 0 ]; then
  echo -e "\n${G}Nothing to commit. Working tree clean.${N}"
  if [ "$NoPush" -eq 0 ]; then
    if git push origin main; then
      echo -e "${G}Pushed.${N}"
    else
      echo -e "${R}Push failed.${N}" >&2
    fi
  fi
  exit 0
fi

[ ${#staged[@]} -gt 0 ] && { echo -e "\n[Staged files:]"; for f in "${staged[@]}"; do echo "  + $f"; done; }
[ ${#unstaged[@]} -gt 0 ] && { echo -e "\n[Unstaged modified:]"; for f in "${unstaged[@]}"; do echo "  ~ $f"; done; }
[ ${#untracked[@]} -gt 0 ] && { echo -e "\n[Untracked files:]"; for f in "${untracked[@]}"; do echo "  ? $f"; done; }

echo -e "\n${Y}==========================================${N}"
echo -e "${Y} Phase 2: Strict Constraints ${N}"
echo -e "${Y}==========================================${N}"
echo "The following are FORBIDDEN (hard failures):"
echo "  1. NO FILE DELETION   - never 'git rm'/'rm'/'del'."
echo "  2. NO BLANKET STAGING - never 'git add .'/'git add -A'/'git commit -a'."
echo "  3. NO CUSTOM ALIASES  - never 'git ac'."

echo -e "\n${Y}==========================================${N}"
echo -e "${Y} Phase 3: Group files, classify taxonomy ${N}"
echo -e "${Y}==========================================${N}"

tmp=$(mktemp -d)
trap 'rm -r "$tmp"' EXIT

remaining=("${all[@]}")
unit_count=0

while [ ${#remaining[@]} -gt 0 ]; do
  echo -e "\nRemaining files:"
  for i in "${!remaining[@]}"; do
    echo "  [$i] ${remaining[$i]}"
  done

  read -r -p "Comma-separated indices for this commit unit (e.g. 0,1,3), or ENTER for all remaining: " indices
  unit_files=()
  if [ -z "$indices" ]; then
    unit_files=("${remaining[@]}")
    remaining=()
  else
    IFS=',' read -ra idxs <<< "$indices"
    for n in "${idxs[@]}"; do
      n=$(printf '%s' "$n" | tr -d '[:space:]')
      if ! [[ "$n" =~ ^[0-9]+$ ]]; then
        echo -e "${R}Invalid index: $n${N}"
        continue
      fi
      if [ "$n" -lt 0 ] || [ "$n" -ge ${#remaining[@]} ]; then
        echo -e "${R}Index out of range: $n${N}"
        continue
      fi
      unit_files+=("${remaining[$n]}")
    done
    if [ ${#unit_files[@]} -eq 0 ]; then
      echo -e "${R}No valid selections. Try again.${N}"
      continue
    fi
    new_remaining=()
    for i in "${!remaining[@]}"; do
      selected=0
      for n in "${idxs[@]}"; do
        n=$(printf '%s' "$n" | tr -d '[:space:]')
        [ "$i" -eq "$n" ] 2>/dev/null && { selected=1; break; }
      done
      [ "$selected" -eq 0 ] && new_remaining+=("${remaining[$i]}")
    done
    remaining=("${new_remaining[@]}")
  fi

  echo -e "\n--- Classify this unit ---"
  echo "Files: ${unit_files[*]}"

  tax=""
  while ! [[ "$tax" =~ ^[A-Ea-e]$ ]]; do
    read -r -p "Category [A/B/C/D/E]: " tax
    [ -n "$tax" ] && tax=$(printf '%s' "$tax" | tr '[:lower:]' '[:upper:]')
  done

  diff=""
  while true; do
    read -r -p "Difficulty (1-13 Fib). Default 5: " diff
    [ -z "$diff" ] && diff=5
    if [[ "$diff" =~ ^[0-9]+$ ]] && [ "$diff" -ge 1 ] && [ "$diff" -le 13 ]; then
      break
    fi
    echo -e "${R}Invalid difficulty. Enter 1-13.${N}"
  done

  read -r -p "Scope/filenames (e.g. 'scripts/commit.sh'): " scope
  [ -z "$scope" ] && scope="${unit_files[0]}"

  action=""
  while [ -z "$action" ]; do
    read -r -p "Action description: " action
    [ -z "$action" ] && echo -e "${R}Action is required.${N}"
  done

  read -r -p "DoD tag (e.g. 'SprintName-item', or ENTER for '0 <infrastructure>'): " dod
  if [ -z "$dod" ]; then
    dod="DoD:0 <infrastructure>"
  else
    dod="DoD:$dod"
  fi

  case "$tax" in
    A) category="Forward progress" ;;
    B) category="Critical bug fix" ;;
    C) category="Refactor" ;;
    D) category="Configuration" ;;
    E) category="Polish" ;;
  esac

  msg="Difficulty: $diff - $tax, $category ($scope): $action -> $dod"

  mkdir -p "$tmp/$unit_count"
  printf '%s\n' "$msg" > "$tmp/$unit_count/msg"
  printf '%s\n' "${unit_files[@]}" > "$tmp/$unit_count/files"

  unit_count=$((unit_count + 1))

  if [ ${#remaining[@]} -gt 0 ]; then
    if ! confirm_yesno "Add another commit unit?" y; then
      break
    fi
  fi
done

if [ "$unit_count" -eq 0 ]; then
  echo -e "${Y}No commit units defined. Aborting.${N}"
  exit 0
fi

echo -e "\n${G}==========================================${N}"
echo -e "${G} Phase 4: Planned Commands ${N}"
echo -e "${G}==========================================${N}"

for ((i=0; i<unit_count; i++)); do
  mapfile -t f < "$tmp/$i/files"
  m=$(< "$tmp/$i/msg")
  echo ""
  echo -e "${Dg}  git add${N} ${f[*]}"
  echo -e "${Dg}  git commit -m${N} '$m'"
  for file in "${f[@]}"; do
    echo "    - $file"
  done
done

if [ "$NoPush" -eq 0 ]; then
  echo -e "\n${Dg}Final step: git push origin main${N}"
fi

echo ""
if ! confirm_yesno "Execute these commands now?" y; then
  echo -e "${Y}Aborted. No changes made.${N}"
  exit 0
fi

for ((i=0; i<unit_count; i++)); do
  echo -e "\n${C}[Staging + committing]${N}"

  mapfile -t f < "$tmp/$i/files"
  m=$(< "$tmp/$i/msg")

  if ! git add -- "${f[@]}"; then
    echo -e "${R}  git add failed. Aborting.${N}"
    exit 1
  fi

  staged_now=$(git diff --cached --name-only)
  echo "  Staged:"
  if [ -n "$staged_now" ]; then
    while IFS= read -r line; do
      echo "    $line"
    done <<< "$staged_now"
  fi

  if ! git commit -m "$m"; then
    echo -e "${R}  COMMIT FAILED. Aborting.${N}"
    exit 1
  fi
  commit_hash=$(git log -1 --format='%h %s')
  echo -e "${G}  Committed: $commit_hash${N}"
done

if [ "$NoPush" -eq 0 ]; then
  echo -e "\n${C}[Pushing to origin main]${N}"
  if git push origin main; then
    echo -e "${G}Push OK:${N}"
  else
    echo -e "${R}Push failed.${N}" >&2
  fi
fi

echo -e "\nDone. AGENTS.md: end sessions cleanly."
exit 0
