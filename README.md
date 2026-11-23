# SAP ABAP Portfolio

SAP ECC에서 개발한 ABAP 프로그램과 SAPUI5 앱을 모아 둔 저장소입니다.

## Projects

### [MM] Purchasing Processing Info · [보기](projects/mm-purchasing-processing-info)

[![MM](projects/mm-purchasing-processing-info/images/02_main_alv.jpg)](projects/mm-purchasing-processing-info)

구매오더 기준으로 구매 · 입고 · 송장 데이터를 한 화면에서 조회하고, 입고 처리와 취소까지 하는 ABAP 리포트입니다. (개인 개발)

- ALV 3개(PO 상세 + 거래처 · 자재 요약)를 Splitter로 배치
- `BAPI_GOODSMVT_CREATE` / `CANCEL`로 입고 처리 · 취소
- Tabstrip 팝업에서 GR / IR 이력 조회 (1건은 상세 화면, 여러 건은 ALV)

### 먹고리즘 · [보기](projects/ui5-mukgorithm)

[![Mukgorithm](projects/ui5-mukgorithm/images/02_random_screens.png)](projects/ui5-mukgorithm)

회사 근처 맛집 기록으로 점심 메뉴를 골라주는 SAPUI5 모바일 웹앱입니다. (5인 팀 · 랜덤 추천 화면과 데이터 설계 담당)

### ABAP SQL 35제 · [보기](mentoring/abap-sql-quiz)

[![Quiz](mentoring/abap-sql-quiz/images/01_quiz_card.png)](mentoring/abap-sql-quiz)

SAP CODE 멘토링에서 멘티 연습용으로 만든 Open SQL 문제 웹페이지입니다. 입력한 SELECT문을 실제로 실행해 결과로 채점합니다.

## 그 밖의 자료

[practice/ui5](practice/ui5) — UI5 수업 실습 4개 (기초 컨트롤, 라우팅, 생산 오더 관리 시험, OData 연동)

## 환경

SAP ECC · SAP GUI (SE38 / SE51 / SE41 / SE80) · SAP BAS · SAPUI5 1.154
