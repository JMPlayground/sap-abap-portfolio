# 04. OData V2 연동 (Northwind)

JSON 대신 실제 OData 서비스(Northwind 공개 서비스)에 연결해 제품 목록 · 상세를 조회했습니다.

| 파일 | 배운 것 |
|---|---|
| `manifest.json` | `dataSources`에 OData 서비스 등록 → 기본 모델로 연결 |
| `View1` | `items="{/Products}"` 목록, 제품 번호(EQ) / 이름(Contains) 검색, 행 클릭 → 상세 |
| `Detail` | `detail/{ProductID}` → `bindElement("/Products(" + id + ")")`, `oModel.read` success / error |
| `ui5-mock.yaml` · `localService/` | 서버 없이 `metadata.xml`로 돌리는 Mock 설정 |

**JSON과 다른 점** — JSON은 데이터를 다 들고 있어서 `findIndex`로 찾지만, OData는 **키로 경로를 만들어** 서버에 요청합니다. (`/Products(3)`)

## 면접용 용어
- **OData** — REST 기반 SAP 표준 데이터 프로토콜. URL로 조회 · 필터 · 정렬을 요청
- **Entity Set / Key** — `/Products` 는 목록, `/Products(3)` 은 키로 지정한 한 건
- **ODataModel.read** — 서버에 직접 조회 요청, 결과는 success / error 콜백으로 받음
- **Mock Server** — 백엔드 없이 metadata로 가짜 응답을 만들어 화면 개발
