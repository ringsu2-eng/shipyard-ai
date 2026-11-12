# qc-kit

주간 검사기록(`data/`)을 집계 → 감사 → 회의 문장 순서로 처리하는 플러그인.

## 구성
- 스킬: `weekly-ship` (`/qc-kit:weekly-ship`)
- 에이전트: `qc-aggregator`(집계), `qc-auditor`(감사), `qc-writer`(회의 문장)
- 훅: `protect-data.js` (PreToolUse) — `data/` 원본을 바꾸는 편집·셸 명령을 차단

## 사용
`claude --plugin-dir C:\work\qc-kit\plugins\qc-kit`

## 전제와 한계
- 대상 프로젝트가 `data/`(원본), `out/`(결과) 구조여야 한다.
- 훅은 완벽하지 않다. 변수로 경로를 쪼개거나 스크립트 파일 안에서 저장하면 못 막는다. 반대로 `cp data/a.xlsx out/` 같은 정상 복사도 막는다.
- 원 설정의 `permissions.deny: Edit(./data/**)`는 플러그인이 제공하지 못한다. 필요하면 프로젝트 settings에 직접 추가한다.
- 개발 흐름 스킬 `ship`(planner/coder/reviewer)은 QC와 무관해 담지 않았다.

## 시험
`node hook-test.js [--strict] hooks/scripts/protect-data.js` (hook-test.js는 weekly-qc에 있음)
