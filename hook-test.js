// 원본 보호 훅 시험기. 사용: node C:/work/labs/현업미션/참고/hook-test.js .claude/hooks/내훅.js
// block이어야 할 시도 7개, allow여야 할 시도 6개를 넣어 보고 결과를 ok/FAIL로 보여 줍니다. FAIL이 없으면 끝 상태 코드가 0입니다.
// --strict를 붙이면 우회 시도(대소문자, .., MultiEdit, NotebookEdit, sed -i, 깨진 입력 등)를 더 넣어 봅니다.
//   예: node hook-test.js --strict .claude/hooks/내훅.js
// 시도마다 10초 안에 끝나지 않으면 TIME으로 표시하고 FAIL로 셉니다.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const hookArg = args.find((a) => a !== "--strict");
if (!hookArg) {
  console.error("사용법: node hook-test.js [--strict] <훅 파일 경로>\n예: node C:\\work\\labs\\현업미션\\참고\\hook-test.js .claude\\hooks\\protect-data.js");
  process.exit(2);
}
const hook = path.resolve(hookArg);
if (!fs.existsSync(hook)) {
  console.error(`훅 파일이 없습니다: ${hook}\n지금 폴더(${process.cwd()})를 기준으로 경로를 다시 확인하세요.`);
  process.exit(2);
}

const cases = [
  ["block", { tool_name: "Edit", tool_input: { file_path: "C:\\work\\weekly-qc\\data\\조립팀_자주검사기록.xlsx" } }],
  ["block", { tool_name: "Write", tool_input: { file_path: "C:/work/weekly-qc/data/new.xlsx" } }],
  ["block", { tool_name: "PowerShell", tool_input: { command: "Copy-Item out\\fixed.xlsx data\\조립팀_자주검사기록.xlsx -Force" } }],
  ["block", { tool_name: "Bash", tool_input: { command: "python -c \"import openpyxl; wb=openpyxl.load_workbook('data/a.xlsx'); wb.save('data/a.xlsx')\"" } }],
  ["block", { tool_name: "PowerShell", tool_input: { command: "Remove-Item data\\*.xlsx" } }],
  ["block", { tool_name: "Bash", tool_input: { command: "git checkout -- data/" } }],
  ["allow", { tool_name: "PowerShell", tool_input: { command: "Get-ChildItem data" } }],
  ["allow", { tool_name: "Write", tool_input: { file_path: "C:/work/weekly-qc/out/summary.xlsx" } }],
  ["allow", { tool_name: "Bash", tool_input: { command: "uv run --with openpyxl python make.py data out/summary.xlsx" } }],
  ["allow", { tool_name: "Bash", tool_input: { command: "cat data/a.csv 2>&1 | head -5" } }],
  ["block", { tool_name: "Bash", tool_input: { command: "echo x > data/a.csv" } }],
  ["allow", { tool_name: "Read", tool_input: { file_path: "C:/work/weekly-qc/data/a.xlsx" } }],
  ["allow", { tool_name: "Write", tool_input: { file_path: "C:/work/weekly-qc/metadata/x.md" } }],
];

// --strict에서만 더하는 시도. 문자열 입력은 JSON으로 바꾸지 않고 그대로 보냅니다.
const strictCases = [
  ["block", { tool_name: "Write", tool_input: { file_path: "C:\\work\\weekly-qc\\DATA\\a.xlsx" } }],
  ["block", { tool_name: "Write", tool_input: { file_path: "C:/work/weekly-qc/out/../data/a.xlsx" } }],
  ["block", { tool_name: "Write", tool_input: { file_path: "data\\a.csv" }, cwd: "C:\\work\\weekly-qc" }],
  ["block", { tool_name: "Write", tool_input: { file_path: "C:/work/weekly-qc/data./a.xlsx" } }],
  ["block", { tool_name: "MultiEdit", tool_input: { file_path: "C:/work/weekly-qc/data/a.csv", edits: [] } }],
  ["block", { tool_name: "NotebookEdit", tool_input: { notebook_path: "C:/work/weekly-qc/data/check.ipynb" } }],
  ["block", { tool_name: "PowerShell", tool_input: { command: "Set-Content -Path .\\data\\a.csv -Value x" } }],
  ["block", { tool_name: "PowerShell", tool_input: { command: "'x' | Out-File data\\a.csv" } }],
  ["block", { tool_name: "PowerShell", tool_input: { command: "Move-Item out\\a.xlsx data\\a.xlsx -Force" } }],
  ["block", { tool_name: "PowerShell", tool_input: { command: "Import-Csv out\\a.csv | Export-Csv data\\a.csv" } }],
  ["block", { tool_name: "Bash", tool_input: { command: "sed -i 's/불합격/합격/' data/a.csv" } }],
  ["block", { tool_name: "Bash", tool_input: { command: "cat out/a.csv | tee data/a.csv" } }],
  ["block", { tool_name: "Bash", tool_input: { command: "python -c \"open('data/a.csv','w').write('x')\"" } }],
  ["block", "{not json"],
  ["block", ""],
  ["allow", { tool_name: "Write", tool_input: { file_path: "C:/work/weekly-qc/data/../out/a.xlsx" } }],
  ["allow", { tool_name: "Glob", tool_input: { pattern: "data/**/*.xlsx" } }],
  ["allow", { tool_name: "Grep", tool_input: { pattern: "불합격", path: "data" } }],
  ["allow", { tool_name: "PowerShell", tool_input: { command: "Import-Csv data\\a.csv | Measure-Object" } }],
  ["allow", { tool_name: "Bash", tool_input: { command: "git status data/" } }],
  ["allow", { tool_name: "Write", tool_input: { file_path: "C:/work/weekly-qc/out/database-notes.md" } }],
];

const label = (c) => {
  if (typeof c === "string") return c ? `(깨진 입력) ${c}` : "(빈 입력)";
  const t = c.tool_input || {};
  return `${c.tool_name} ${String(t.command || t.file_path || t.notebook_path || t.pattern || "")}`;
};

let bad = 0;
for (const [want, c] of strict ? cases.concat(strictCases) : cases) {
  const r = spawnSync(process.execPath, [hook], { input: typeof c === "string" ? c : JSON.stringify(c), timeout: 10000, encoding: "utf8" });
  const got = r.error && r.error.code === "ETIMEDOUT" ? "TIME" : r.status === 2 ? "block" : r.status === 0 ? "allow" : "ERR" + r.status;
  if (got !== want) bad++;
  console.log(`${got === want ? "ok  " : "FAIL"} ${got.padEnd(5)} ${label(c).slice(0, 70)}`);
  if (got !== want && r.stderr) console.log(`     stderr: ${r.stderr.trim().split("\n")[0].slice(0, 100)}`);
}
console.log(`\nFAIL ${bad}개`);
process.exit(bad ? 1 : 0);
