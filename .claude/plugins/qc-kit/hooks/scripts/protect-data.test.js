// protect-data.js 시험. 사용: node protect-data.test.js
// 수강생용 시험기(참고/hook-test.js)를 기본 13개와 --strict 추가 시도로 두 번 돌린다. 둘 다 FAIL이 없으면 종료 코드 0이다.
"use strict";
const { spawnSync } = require("child_process");
const path = require("path");

const tester = path.join(__dirname, "..", "..", "hook-test.js");
const hook = path.join(__dirname, "protect-data.js");
let bad = 0;
for (const extra of [[], ["--strict"]]) {
  console.log(`== hook-test.js ${extra.join(" ") || "(기본)"}`);
  const r = spawnSync(process.execPath, [tester, ...extra, hook], { stdio: "inherit", timeout: 120000 });
  if (r.status !== 0) bad++;
}
process.exit(bad ? 1 : 0);
