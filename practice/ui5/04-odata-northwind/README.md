# 04. OData V2 연동 (Northwind)

JSON 대신 Northwind 공개 OData 서비스에 연결해 제품 목록 · 상세를 조회했습니다.

| 파일 | 내용 |
|---|---|
| `manifest.json` | `dataSources`에 OData 서비스 등록 → 기본 모델로 연결 |
| `View1` | `/Products` 목록, 제품 번호(EQ) · 이름(Contains) 검색, 행 클릭 → 상세 |
| `Detail` | `detail/{ProductID}` → `bindElement("/Products(" + id + ")")`, `read` 호출 |
| `ui5-mock.yaml` · `localService/` | 서버 없이 `metadata.xml`로 실행하는 Mock 설정 |
