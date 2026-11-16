sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "ncode/zncl0402ljm/model/formatter"
], function (Controller, Filter, FilterOperator, MessageToast, formatter) {
    "use strict";

    // 위 배열(경로)과 아래 function 매개변수는 "순서·개수" 1:1 짝꿍!

    return Controller.extend("ncode.zncl0402ljm.controller.List", {

        formatter: formatter,

        // ==================================================================
        // 검색 : 검색어(기준 필드 Contains) + 상태(EQ) → AND 조건으로 필터
        // ==================================================================
        onSearch: function () {
            const sKey    = this.byId("cOrderCombo").getSelectedKey();
            const sValue  = this.byId("inpKeyword").getValue().trim();
            const sStatus = this.byId("selStatus").getSelectedKey();
            const aFilters = [];

            // [예외] 검색어는 있는데 기준이 없음
            if (sValue && !sKey) {
                MessageToast.show("검색 기준을 선택해 주세요.");
                return;
            }

            if (sValue) {
                aFilters.push(new Filter(sKey, FilterOperator.Contains, sValue));
            }
            if (sStatus) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }

            const oBinding = this.byId("idOrderTable").getBinding("items");

            // 조건이 없으면 필터 해제 = 전체 조회
            oBinding.filter(aFilters.length ? new Filter({ filters: aFilters, and: true }) : []);

            const iCount = oBinding.getLength();
            MessageToast.show(iCount === 0 ? "검색 결과가 없습니다." : iCount + "건이 조회되었습니다.");
        },

        // ==================================================================
        // 초기화 : 검색 조건 원래대로 + 필터 해제
        // ==================================================================
        onReset: function () {
            this.byId("cOrderCombo").setSelectedKey("OrderID");
            this.byId("inpKeyword").setValue("");
            this.byId("selStatus").setSelectedKey("");
            this.byId("idOrderTable").getBinding("items").filter([]);
        },

        // ==================================================================
        // 테이블 갱신 후 : 제목에 전체 건수 표시 "생산 오더 목록 (50)"
        // ==================================================================
        onUpdateFinished: function (oEvent) {
            const iTotal = oEvent.getParameter("total");
            this.byId("tableTitle").setText("생산 오더 목록 (" + iTotal + ")");
        },

        // ==================================================================
        // 행 선택 → Detail 이동 : OrderID 를 URL 파라미터로 전달
        //   navTo 이름 "detail" / 키 OrderID = manifest pattern detail/{OrderID}
        // ==================================================================
        onOrderSelect: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");

            // [예외] 선택 해제
            if (!oItem) {
                return;
            }

            this.getOwnerComponent().getRouter().navTo("detail", {
                OrderID: oItem.getBindingContext().getProperty("OrderID")
            });

            // 돌아왔을 때 선택 표시 남지 않게
            oEvent.getSource().removeSelections(true);
        }
    });
});
