sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"

], function (Controller, Filter, FilterOperator, Sorter, MessageBox, MessageToast, History) {
    "use strict"; // strict 모드 : 잘못된 구문을 에러로 알려줌

    // 위 배열(경로)과 아래 function 매개변수는 "순서·개수" 1:1 짝꿍!

    return Controller.extend("ncode.zncl0402ljm.controller.Detail", {

        // ==================================================================
        // onInit : 화면이 처음 만들어질 때 1회 실행
        // ==================================================================
        onInit: function () {

        // ==================================================================
        // onInit : "detail" 라우트로 들어올 때마다 _onObjectMatched 실행 등록
        // ==================================================================    

        let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
            
        },

        // ==================================================================
        // URL 의 OrderID → /Orders 배열 index 찾기 → View 전체 Context Binding
        // ==================================================================
        _onObjectMatched: function (oEvent) {
            let sOrderID    = oEvent.getParameter("arguments").OrderID;
            let oModel      = this.getOwnerComponent().getModel();

        // JSON 로드 완료 후 검색 (상세에서 새로고침 대비)
            oModel.dataLoaded().then(function () {
                let aOrders     = oModel.getProperty("/Orders") || [];
                let iIndex      = aOrders.findIndex(function (oOrder) {
                    return oOrder.OrderID === sOrderID;
                });

                // [예외] 없는 OrderID
                if (iIndex === -1) {
                     // URL은 그대로 두고 NotFound 화면만 표시 (공식 튜토리얼 Step 5 방식)
                        this.getOwnerComponent().getRouter().getTargets().display("notFound");
                        return;
                }

                this.getView().bindElement("/Orders/" + iIndex);        // 예: /Orders/8
                this.byId("idItemTable").removeSelections(true);        // 이전 오더 체크 해제
            }.bind(this));
        },

        // ==================================================================
        // 뒤로가기 : 브라우저 History → 목록의 검색어·스크롤 그대로 유지
        // ==================================================================
        onNavBack: function () {
            let sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
            }
        },

        // ==================================================================
        // 생산 시작 : 01(계획) → 02(진행 중)
        // ==================================================================
        onStart: function () {
            this._changeStatus("01", "02", "생산이 시작되었습니다.");
        },

        // ==================================================================
        // 생산 완료 : 02(진행 중) → 03(완료)
        // ==================================================================
        onComplete: function () {
            this._changeStatus("02", "03", "생산이 완료되었습니다.");
        },

        // 공통 : 현재 Context 경로 + "/Status" 에 setProperty → 폼·버튼·List 자동 갱신
        _changeStatus: function (sFrom, sTo, sMsg) {
            let oContext    = this.getView().getBindingContext();

            // [예외] 바인딩 안 됨
            if (!oContext) {
                MessageBox.error("선택된 생산 오더가 없습니다.");
                return;
            }

            // [예외] 버튼 enabled 로 막지만 이중 체크
            if (oContext.getProperty("Status") !== sFrom) {
                MessageBox.warning("현재 상태에서는 처리할 수 없습니다.");
                return;
            }

            oContext.getModel().setProperty(oContext.getPath() + "/Status", sTo);   // /Orders/n/Status
            MessageToast.show(oContext.getProperty("OrderID") + " : " + sMsg);
        },

        // ==================================================================
        // Formatter
        // ==================================================================
        // 숫자 콤마 : 2657 → "2,657" (단위는 ObjectNumber unit 속성이 표시)
        formatNumber: function (vNum) {
            if (vNum === null || vNum === undefined || isNaN(Number(vNum))) {
                return "";
            }
            return Number(vNum).toLocaleString();
        },

        // 생산 일정 : 납기일 - 시작일 → "6일 소요"
        formatPeriod: function (sStart, sDue) {
            if (!sStart || !sDue) {
                return "";
            }
            let iDays = Math.round((new Date(sDue) - new Date(sStart)) / (1000 * 60 * 60 * 24));   // ms → 일
            return iDays + "일 소요";
        },



    });
});