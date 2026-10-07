#!/usr/bin/env bash
# Claims the next ready sourcing-tree issue and hands it to a fully
# non-interactive, permission-prompt-free, backgrounded Devin session.
# Replaces: open terminal -> type devin -> paste prompt -> click through
# the permission menu, for every single agent.
set -euo pipefail
REPO=/home/jan/work/sanglogium
LOGDIR="$REPO/_project/agent-logs"
mkdir -p "$LOGDIR"
cd "$REPO"

CLAIMED=$(bd ready --parent sang-logium-zdb --claim --json)
if [ "$CLAIMED" = "[]" ] || [ -z "$CLAIMED" ]; then
  echo "No ready issues left in the sourcing tree."
  exit 0
fi

ISSUE_ID=$(echo "$CLAIMED" | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])")

PROMPT_FILE=$(mktemp /tmp/devin-prompt-XXXXXX.txt)
cat > "$PROMPT_FILE" <<EOF
Run: bd show $ISSUE_ID
Follow its EXECUTION PROTOCOL and SOURCING PROTOCOL sections exactly. Source real,
cited data for every product listed, write one .md file per product under the path
stated in the issue. Then run: bd close $ISSUE_ID --reason "<N> products sourced and filed."
Do not touch any other beads issue or brand.
go, no stop
EOF

setsid devin --permission-mode dangerous --respect-workspace-trust false \
  --prompt-file "$PROMPT_FILE" -p \
  > "$LOGDIR/$ISSUE_ID.log" 2>&1 < /dev/null &

echo "Fed $ISSUE_ID -> $LOGDIR/$ISSUE_ID.log (pid $!)"
