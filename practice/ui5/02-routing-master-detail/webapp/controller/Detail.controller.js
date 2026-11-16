sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, History, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("ncode.zncl040203.controller.Detail", {

        // ==================================================================
        // [D1] onInit : "RouteDetail 로 들어오면 _onObjectMatched 실행해줘" 등록
        //      ★ onInit 은 1번만 실행 → 매번 바뀌는 파라미터는 여기서 못 읽음
        // ==================================================================
        onInit: function () {
            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        // ==================================================================
        // [D2] URL 파라미터 → 모델 경로 조립 → bindElement (화면 전체를 그 데이터에 연결)
        // ==================================================================
        _onObjectMatched: function (oEvent) {
            let oArgs       = oEvent.getParameter("arguments");      // { customerIndex, purchaseIndex }
            let sPath       = "/customers/" + oArgs.customerIndex + "/_purchaseList/" + oArgs.purchaseIndex;
            let oModel      = this.getOwnerComponent().getModel();

            this.getView().bindElement(sPath);

            // [예외] 새로고침 등으로 없는 번호가 들어오면 → 목록으로 돌려보냄
            //        dataLoaded() : JSON 파일 로드가 끝난 뒤 확인
            //        ★ navTo 하면 열려있는 Dialog(MessageBox)가 자동으로 닫힘
            //          → 메시지 [확인] 누른 뒤(onClose) 이동
            oModel.dataLoaded().then(function () {
                if (!oModel.getProperty(sPath)) {
                    MessageBox.error("존재하지 않는 데이터입니다.", {
                        onClose : function () {
                            this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
                        }.bind(this)
                    });
                }
            }.bind(this));
        },

        // ==================================================================
        // [D3] 뒤로가기 : 이전 기록 있으면 브라우저 뒤로, 없으면 목록으로
        // ==================================================================
        onNavBack: function () {
            let oHistory        = History.getInstance();
            let sPreviousHash   = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // 세 번째 인자 true = 기록 남기지 않고 교체
                this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
            }
        },

        // ==================================================================
        // [D4] 저장 : 입력값 검증 → 메시지 → 뒤로가기
        // ==================================================================
        onSave: function () {
            let oInput      = this.byId("inpQty");
            let oContext    = this.getView().getBindingContext();

            // [예외] 바인딩된 데이터가 없는 경우
            if (!oContext) {
                MessageBox.error("저장할 데이터가 없습니다.");
                return;
            }

            // [예외] 빈 값 / Type·범위 오류 (빨간 테두리 상태)
            if (!oInput.getValue() || oInput.getValueState() === "Error") {
                MessageBox.error("수량을 1~99 사이 정수로 입력해 주세요.");
                return;
            }

            // 양방향 바인딩이라 이미 모델에 반영됨 → 확인용으로 읽기만
            let iQty        = oContext.getProperty("quantity");
            let sProduct    = oContext.getProperty("productName");

            MessageToast.show(sProduct + " 수량이 " + iQty + "개로 저장되었습니다.");
            this.onNavBack();
        },

        // ==================================================================
        // [D5] Formatter (이 View 에서 쓰는 것만 복사해 둠 → View 단위로 독립)
        // ==================================================================
        formatDate: function (sDate) {
            if (!sDate || String(sDate).length !== 8) {
                return sDate || "";
            }
            return sDate.substring(0, 4) + "/" + sDate.substring(4, 6) + "/" + sDate.substring(6, 8);
        },

        formatPrice: function (vPrice) {
            if (vPrice === null || vPrice === undefined || isNaN(Number(vPrice))) {
                return "";
            }
            return Number(vPrice).toLocaleString() + " 원";
        },

        formatAmount: function (iQty, iPrice) {
            if (isNaN(Number(iQty)) || isNaN(Number(iPrice))) {
                return "";
            }
            return (Number(iQty) * Number(iPrice)).toLocaleString() + " 원";
        }
    });
});