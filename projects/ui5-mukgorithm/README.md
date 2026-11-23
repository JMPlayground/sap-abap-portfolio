# 먹고리즘

회사 근처 맛집 방문 기록으로 "오늘 뭐 먹지"를 골라주는 SAPUI5 모바일 웹앱입니다.

![Random Screens](images/02_random_screens.png)

| | |
|---|---|
| 과정 | SAP CODE 2기 UI5 POU 조별 프로젝트 |
| 인원 | 5명 |
| 환경 | SAPUI5 1.154 · XML View · JSON Model · SAP BAS |
| 화면 | Home(카테고리 · 랜덤 게임) / Main(식당 목록 · 별점 정렬) / 리뷰 팝업 / Random |

## 담당 역할

| 작업 | 내용 |
|---|---|
| 랜덤 추천 화면 | View · Controller · CSS 단독 개발 ([`Random.view.xml`](webapp/view/Random.view.xml), [`Random.controller.js`](webapp/controller/Random.controller.js)) |
| 데이터 정제 | 방문 기록 엑셀 620행 → 중복 제거 → 가게 80곳 × 리뷰 3건 JSON ([`restaurants.json`](webapp/model/restaurants.json)) |
| 계산 구조 | 평균별점 · 대표리뷰를 JSON에 저장하지 않고 앱 시작 시 계산, 리뷰 저장 시 해당 가게만 다시 계산 ([`App.controller.js`](webapp/controller/App.controller.js), `_recalcStore`) |
| 공용 formatter · 디자인 기준 | [`formatter.js`](webapp/model/formatter.js), 브랜드 색상 토큰(`style.css`) |
| 개발 명세서 | View · Fragment 이름, 컨트롤 ID, 함수명, 역할 분담 (v1.0 → v1.3) |

나머지 화면(Home · Main · 리뷰 생성 / 수정)은 팀원이 개발했습니다. 코드 주석 `[정민]`이 본인 작성 부분입니다.

## 랜덤 추천 화면

- **완전랜덤 / 날씨추천** — 날씨(맑음 · 비 · 추움 · 더움)를 고르면 그 날씨에 맞는 20곳 중에서만 추천
- **슬롯 연출** — 0.08초마다 가게 이름이 바뀌다가 2초 뒤 멈춤 (`setInterval` · `setTimeout`)
- **결과 카드** — `bindElement` 한 번으로 사진 · 별점 · 전화 · 대표리뷰 연결
- **리뷰 팝업 재사용** — 메인 화면의 Fragment를 보기 전용으로 불러옴
- 돌리는 중에는 버튼을 막고, 화면을 나가면 타이머와 회전 효과를 정리

![Wireframe](images/01_wireframe.png)

## 문제 해결

| 문제 | 원인 → 해결 |
|---|---|
| 런치패드 미리보기에서 이미지가 안 뜸 | 상대경로가 `test/flp.html` 기준으로 해석됨 → `sap.ui.require.toUrl`로 앱 기준 경로 사용 |
| 버튼 색을 바꿔도 회색 테두리가 남음 | 실제로 그리는 건 안쪽 `.sapMSegBBtnInnerWrapper` (개발자도구로 확인) → 클래스 범위 안에서 안쪽 요소만 색칠 |
| 리뷰를 저장해도 평균별점 · 정렬이 안 바뀜 | formatter는 배열 참조가 같으면 다시 실행되지 않음 → 계산값을 모델에 넣고 저장 시 다시 계산 |
| 대표리뷰와 별점이 서로 다른 리뷰를 가리킴 | 별점이 0번 리뷰에 고정 바인딩 → 같은 기준으로 `RepRating` 계산 |
| 메인의 팝업을 랜덤에서 열면 에러 | 팝업이 부르는 이벤트 함수가 Random 컨트롤러에 없음 → 빈 핸들러 추가, 생성 버튼 숨김 |

음식 사진은 저작권 문제로 1장만 포함했습니다.

## 실행

```bash
npm install
npm run start-noflp
```
