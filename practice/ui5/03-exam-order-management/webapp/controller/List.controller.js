sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast"

], function (Controller, Filter, FilterOperator, Sorter, MessageBox, MessageToast) {
    "use strict"; // strict 모드 : 잘못된 구문을 에러로 알려줌

    // 위 배열(경로)과 아래 function 매개변수는 "순서·개수" 1:1 짝꿍!

    return Controller.extend("ncode.zncl0402ljm.controller.List", {

        // ==================================================================
        // onInit : 화면이 처음 만들어질 때 1회 실행
        // ==================================================================
        onInit: function () {
        },

        // ==================================================================
        // 검색 (Filter) : ComboBox 조건 → Filter 배열 → binding.filter()
        // ==================================================================
        onSearch: function () {
            let sKey        = this.byId("cOrderCombo").getSelectedKey();
            let sValue      = this.byId("inpKeyword").getValue().trim();
            let oBinding    = this.byId("idOrderTable").getBinding("items");
            let aFilters    = [];

            // [예외] 검색 기준 미선택
            if (!sKey) {
                MessageToast.show("검색 기준을 선택해 주세요.");
                return;
            }

            // 검색어 없음 → 필터 해제 = 전체 조회
            if (!sValue) {
                oBinding.filter([]);
                MessageToast.show("전체 " + oBinding.getLength() + "건이 조회되었습니다.");
                return;
            }

            // 선택한 기준(OrderID / Customer / SalesOrder) 에 검색어 포함 여부
            aFilters.push(new Filter(sKey, FilterOperator.Contains, sValue));

            oBinding.filter(aFilters);  
            
            let iCount      = oBinding.getLength();

            if (iCount === 0) {
                MessageToast.show("검색 결과가 없습니다.");
            } else {
                MessageToast.show(iCount + "건이 조회되었습니다.");
            }

        },

        // ==================================================================
        // [L2] 행 선택 → Detail 이동 : OrderID 를 URL 파라미터로 전달
        //      ★ navTo 이름 "detail" / 키 OrderID = manifest pattern detail/{OrderID}
        // ==================================================================
        onOrderSelect: function (oEvent) {
            let oItem       = oEvent.getParameter("listItem");

            // [예외] 선택 해제
            if (!oItem) {
                return;
            }

            let sOrderID    = oItem.getBindingContext().getProperty("OrderID");

            this.getOwnerComponent().getRouter().navTo("detail", {
                OrderID : sOrderID
            });

            // 돌아왔을 때 선택 표시 남지 않게
            oEvent.getSource().removeSelections(true);

                },
        
         // 숫자 콤마 : 1451 → "1,451" (단위는 ObjectNumber unit 이 표시)
        formatNumber: function (vNum) {
            if (vNum === null || vNum === undefined || isNaN(Number(vNum))) {
                return "";
            }
            return Number(vNum).toLocaleString();
        }
    


    });
});