---
description: Upgrade looploop to the latest version
---

# /looploop-upgrade

Upgrade the looploop plugin to the latest version.

## Process

1. Determine the plugin install path by searching for this plugin's directory:
   - Check `~/.claude/plugins/looploop`
   - If not found, search `~/.claude/plugins/` for a directory containing `commands/looploop.md`

2. If no install path is found:
   "Can't find looploop installation. Install it with `/plugin install looploop@erms-arsenal`."

3. Run `git -C <plugin_path> pull --ff-only` to update.

4. If the pull fails (e.g., local modifications), report the error and suggest:
   ```
   cd <plugin_path> && git stash && git pull --ff-only && git stash pop
   ```

5. If the pull succeeds, report:
   - Previous commit (short hash)
   - New commit (short hash)
   - "Upgraded. Restart Claude Code to pick up changes."

6. If already up to date, report: "Already on the latest version."
