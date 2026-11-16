sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";
 
    return Controller.extend("zcl4mukgorithm.zcl4mukgorithm.controller.Home", {
        onInit() {
        },
 
        // 카테고리(한식 / 중식 / 양식 / 기타 / 랜덤게임) 버튼 클릭 이벤트
        onCategoryPress: function (oEvent) {
            let oButton = oEvent.getSource();
            let sLocalId = this.getView().getLocalId(oButton.getId());   // 예: "btnKOR"
            let oRouter = this.getOwnerComponent().getRouter();
 
            let sCategory;
 
            switch (sLocalId) {
                case "btnKOR":
                    sCategory = "KOR";
                    break;
 
                case "btnCHN":
                    sCategory = "CHN";
                    break;
 
                case "btnWST":
                    sCategory = "WST";
                    break;
 
                case "btnETC":
                    sCategory = "ETC";
                    break;
 
                case "btnRandomGame":
                    oRouter.navTo("RouteRandom");
                    return;
 
                default:
                    // 정의되지 않은 버튼이면 이동하지 않음
                    MessageToast.show("알 수 없는 버튼입니다: " + sLocalId);
                    return;
            }
 
            oRouter.navTo("RouteMain", {
                category: sCategory
            });
        },
 
        // 가게 목록에서 행 선택
        onRowSelect: function (oEvent) {
            let oItem = oEvent.getParameter("listItem");
            let oStore = oItem.getBindingContext().getObject();
 
            MessageToast.show(oStore.StoreName + " 선택");
        }
    });
});