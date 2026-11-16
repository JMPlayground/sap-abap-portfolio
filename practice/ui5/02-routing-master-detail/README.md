# 02. Routing · Master-Detail

고객 → 구매내역 → 구매 상세로 이어지는 화면 이동을 연습했습니다.

| 파일 | 배운 것 |
|---|---|
| `List` | 고객 검색 · 초기화, 고객 선택 → 구매내역 표시, 정렬, 팝업, **한/영 전환**(`Localization.setLanguage`) |
| `Detail` | `detail/{customerIndex}/{purchaseIndex}` **파라미터 2개 라우팅**, 저장, History 뒤로가기 |
| `GridList` | 같은 데이터를 다른 레이아웃으로 표시, Filter · Sorter |
| `Basic` | JS 기초 화면 — 계산기 · 구구단 · 별찍기 · 회원 검색 · 등록 |
| `i18n_ko.properties` | 다국어 리소스 (기본 / 한국어) |

## 면접용 용어
- **Router / navTo** — `manifest.json`의 route 이름으로 화면 이동, 파라미터는 URL에 실림
- **History.getPreviousHash** — 이전 화면이 있으면 브라우저 뒤로가기, 없으면 목록으로 이동
- **i18n** — 화면 문구를 언어별 `.properties` 파일로 분리해서 관리
