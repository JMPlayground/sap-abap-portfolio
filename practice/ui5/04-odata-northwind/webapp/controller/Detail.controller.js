sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
  ],
  function (Controller, Fragment, History, MessageToast) {
    "use strict";

    return Controller.extend("ncode.zncl04ljm.controller.Detail", {
      onInit: function () {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("detail")
          .attachPatternMatched(this._onPatternMatched, this);
      },

      _onPatternMatched: async function (oEvent) {
        let sProductId = oEvent.getParameter("arguments").ProductID;
        let oModel = this.getOwnerComponent().getModel();

        //let aProducts = oModel.getProperty("/Products") || [];

        //json은 client Side라서 가능.
        // 모든 데이터를 들구 있음.
        // let iIndex = aProducts.findIndex(function (oProduct) {
        //   return oProduct.OrderID === sProductId;
        // });

        // if (iIndex < 0) {
        //   MessageToast.show("해당 Product를 찾을 수 없습니다.");
        //   this.getOwnerComponent().getRouter().navTo("list", {}, true);
        //   return;
        // }
        // let sPath = "/Products/" + iIndex;
        // this.getView().bindElement(sPath);

        let sPath = "/Products(" + sProductId + ")";

        // Server에 ProductId가 유효한지 확인
        oModel.read(sPath, {
          success: function (oData) {
            console.log("제품 정보:", oData);
          },
          error: function (oError) {
            console.error("조회 오류", oError);
          },
        });

        this.getView().bindElement(sPath);
      },

      onNavBack: function () {
        let oHistory = History.getInstance();
        if (oHistory.getPreviousHash() !== undefined) {
          window.history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo("list", {}, true);
        }
      },
    });
  },
);
