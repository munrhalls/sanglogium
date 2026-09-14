#!/usr/bin/env bash
# Read-only watchdog for the Catalogue Sourcing beads tree + Devin agent fleet.
# Never kills or launches anything -- purely observes and logs, so it cannot
# corrupt in-progress agent work or a bd claim. Safe to leave running unattended.
set -u
REPO=/home/jan/work/sanglogium
LOG=/home/jan/work/sanglogium/_project/sourcing-pipeline-monitor.log
INTERVAL=120

cd "$REPO" || exit 1

echo "=== monitor started $(date -Is) pid=$$ ===" >> "$LOG"

while true; do
  ts=$(date -Is)
  mem=$(free -m | awk '/^Mem:/{print "free="$4"MB avail="$7"MB"}')
  swap=$(free -m | awk '/^Swap:/{print "used="$3"MB/"$2"MB"}')
  load=$(uptime | awk -F'load average:' '{print $2}' | xargs)
  devin_n=$(pgrep -c -f '/devin/cli/.*bin/devin' 2>/dev/null || echo 0)
  ready_n=$(bd ready --parent sang-logium-zdb 2>/dev/null | grep -c '^Ready:' )
  ready_line=$(bd ready --parent sang-logium-zdb 2>/dev/null | grep '^Ready:')
  closed_hp=$(bd show sang-logium-zdb.1 2>/dev/null | grep -oE '[0-9]+/[0-9]+ complete')
  closed_ae=$(bd show sang-logium-zdb.2 2>/dev/null | grep -oE '[0-9]+/[0-9]+ complete')
  closed_ac=$(bd show sang-logium-zdb.3 2>/dev/null | grep -oE '[0-9]+/[0-9]+ complete')

  line="$ts | mem: $mem | swap: $swap | load: $load | devin_procs: $devin_n | $ready_line | headphones: $closed_hp | audio-electronics: $closed_ae | accessories: $closed_ac"
  echo "$line" >> "$LOG"

  avail_mb=$(free -m | awk '/^Mem:/{print $7}')
  if [ "${avail_mb:-9999}" -lt 800 ]; then
    echo "$ts | *** WARNING: available memory below 800MB ($avail_mb MB) -- consider not starting new agents until this recovers ***" >> "$LOG"
  fi

  sleep "$INTERVAL"
done
