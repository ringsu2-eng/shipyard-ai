---
name: weekly-ship
description: 주간 검사기록을 집계-감사-회의 문장 순서로 돌린다
disable-model-invocation: true
---
0. out/ 폴더가 없으면 만든다.
1. qc-aggregator 서브에이전트에게 집계를 시킨다.
2. qc-auditor에게 out/ 집계와 data/ 원본의 대조를 시킨다.
   auditor의 반려 기준을 바꾸거나 빼라고 지시하지 않는다.
3. auditor의 판정을 out/review.md에 남긴다.
   auditor는 쓰기 권한이 없으므로 기록은 내가 한다.
4. 반려면 지적 사항만 qc-aggregator에게 다시 넘겨
   재집계하고 2로 돌아간다. 이 과정은 최대 2번까지만 한다.
   2번 뒤에도 반려면 남은 지적을 보여 주고 멈춘다.
   이 경우 문장은 쓰지 않는다.
5. 통과하면 qc-writer에게 회의 문장 세 줄을 시킨다.
   결과(out/meeting.md)를 보여 주고 멈춘다.

review.md에는 회차마다 판정, 대상 파일, 지적 건수를
남긴다. 덮어쓰지 않고 아래에 더한다.
