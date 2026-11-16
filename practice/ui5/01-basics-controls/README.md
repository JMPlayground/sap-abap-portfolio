# 01. UI5 기초 컨트롤

UI5를 처음 배우면서 만든 실습입니다. View 하나에 컨트롤 하나씩 붙여 보며 바인딩 · 이벤트 · 팝업 기본기를 익혔습니다.

| 파일 | 배운 것 |
|---|---|
| `View1` | JSON 모델 조회 · 등록 · 수정, 검색 |
| `View2` | `sap.ui.table.Table`, ComboBox 선택에 따른 필터, 행 선택 이벤트 |
| `View3` | 등록 폼, Fragment 팝업 열기 / 닫기 |
| `View4` | Filter · Sorter(이름순 · 나이순), formatter(전화번호 · 날짜) |
| `Detail` | SimpleForm 상세 화면, 저장 |
| `Img` | 이미지 표시 (실습용 이미지는 레포에서 제외) |
| `*.fragment.xml` | 팝업 · 추가 정보 입력용 Fragment 4종 |

## 면접용 용어
- **JSONModel** — 클라이언트에 데이터를 통째로 들고 있는 모델. 바인딩한 화면이 값 변경에 자동 반응
- **Fragment** — 컨트롤러 없이 재사용하는 UI 조각 (팝업 · 폼에 주로 사용)
- **Filter / Sorter** — 바인딩(`getBinding("items")`)에 걸어서 목록을 거르고 정렬
