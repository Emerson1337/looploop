import { readFileSync } from "fs";
import { join } from "path";

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";

const ARROW = "\u25B6";
const CHECK = "\u2714";
const LOOP = "\u21BB";

const progressFile = join(process.cwd(), ".looploop", "progress.txt");

try {
  const content = readFileSync(progressFile, "utf-8");
  const phase = content.match(/^Phase:\s*(.+)$/m)?.[1]?.trim();
  const iterMatch = content.match(/^Iteration:\s*(\d+)\/(\d+)$/m);
  const current = parseInt(iterMatch?.[1] || "0", 10);
  const max = parseInt(iterMatch?.[2] || "0", 10);

  if (current < max) {
    const next = current + 1;
    const bar = progressBar(next, max);

    console.log();
    console.log(`${CYAN}${BOLD}  ${LOOP} looploop${RESET} ${DIM}— iteration loop${RESET}`);
    console.log();
    console.log(`  ${YELLOW}${ARROW}${RESET} ${BOLD}Phase: ${phase}${RESET}  ${DIM}iteration${RESET} ${BOLD}${next}${RESET}${DIM}/${max}${RESET}`);
    console.log(`    ${bar}`);
    console.log();
    console.log(
      `  Read .looploop/progress.txt and .looploop/prd.md, then continue the current phase.`
    );
    console.log();

    process.exit(2);
  }

  // All iterations done
  console.log();
  console.log(`${CYAN}${BOLD}  ${CHECK} looploop${RESET} ${DIM}— phase complete${RESET}`);
  console.log();
  console.log(`  ${GREEN}${BOLD}${phase}${RESET} ${DIM}finished all ${max} iteration${max !== 1 ? "s" : ""}${RESET}`);
  console.log();
} catch {
  // No progress file or parse error — allow normal exit
}
process.exit(0);

function progressBar(current, max) {
  const width = 20;
  const filled = Math.round((current / max) * width);
  const empty = width - filled;
  const bar = `${GREEN}${"█".repeat(filled)}${DIM}${"░".repeat(empty)}${RESET}`;
  const pct = Math.round((current / max) * 100);
  return `${bar} ${DIM}${pct}%${RESET}`;
}
