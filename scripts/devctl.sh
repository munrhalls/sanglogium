#!/usr/bin/env bash
# Human-run dev-server control. Agents must not run this (see CLAUDE.md ban).
#   scripts/devctl.sh restart           kill, then start (fixes most wedges, keeps .next)
#   scripts/devctl.sh restart --clean   also drop .next build output, keep .next/cache
#   scripts/devctl.sh restart --nuke    rm -rf .next (last resort)
#   scripts/devctl.sh watch             flag a wedged/bloated server before you click around
set -u
cd "$(dirname "$0")/.."
PORT=3000
PROBE="http://localhost:$PORT/robots.txt"   # tiny route: cheap even on a cold compile
RSS_WARN_MB=4000
SWAP_WARN_PCT=90

kill_dev() {
  local pids
  pids="$( (ss -ltnp "sport = :$PORT" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2; pgrep -f "$PWD/node_modules/.bin/next") | sort -u)"
  [ -z "$pids" ] && return 0
  kill $pids 2>/dev/null
  for _ in 1 2 3 4 5 6; do
    sleep 0.5
    ss -ltn "sport = :$PORT" 2>/dev/null | grep -q LISTEN || return 0
  done
  kill -9 $pids 2>/dev/null
}

case "${1:-}" in
  restart)
    kill_dev
    case "${2:-}" in
      --clean) find .next -mindepth 1 -maxdepth 1 ! -name cache -exec rm -rf {} + 2>/dev/null ;;
      --nuke)  rm -rf .next ;;
    esac
    exec npm run dev
    ;;
  watch)
    fails=0
    while sleep 10; do
      msg=""
      code="$(curl -s -o /dev/null -m 8 -w '%{http_code}' "$PROBE")"
      if [ "$code" != "200" ]; then fails=$((fails + 1)); else fails=0; fi
      [ "$fails" -ge 2 ] && msg="WEDGED: $PROBE gave '$code' $fails times. Run: scripts/devctl.sh restart"
      pid="$(ss -ltnp "sport = :$PORT" 2>/dev/null | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)"
      if [ -n "$pid" ]; then
        rss_mb=$(( $(ps -o rss= -p "$pid" 2>/dev/null || echo 0) / 1024 ))
        [ "$rss_mb" -ge "$RSS_WARN_MB" ] && msg="${msg:+$msg | }BLOATED: next-server ${rss_mb} MB. Restart before it wedges."
      fi
      swap_pct="$(free | awk '/Swap/ && $2 > 0 {printf "%d", $3 * 100 / $2}')"
      [ "${swap_pct:-0}" -ge "$SWAP_WARN_PCT" ] && msg="${msg:+$msg | }SWAP ${swap_pct}% full: close other apps or agents."
      if [ -n "$msg" ]; then
        echo "$(date +%T) $msg"
        command -v notify-send >/dev/null && notify-send -u critical "dev server" "$msg"
      fi
    done
    ;;
  *) sed -n 2,7p "$0"; exit 1 ;;
esac
