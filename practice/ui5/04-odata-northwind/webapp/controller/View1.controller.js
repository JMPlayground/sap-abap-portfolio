sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], (Controller,Filter,FilterOperator,MessageToast) => {
    "use strict";

    return Controller.extend("ncode.zncl04ljm.controller.View1", {
        onInit() {
        },

onSearch: function () {
      let sField    = this.byId("searchField").getSelectedKey();
      let sText     = this.byId("searchText").getValue().trim();
      let oTable    = this.byId("productTable");
      let oBinding  = oTable.getBinding("items");

      if (!sText) {
        oBinding.filter([]);
        return;
      }

      let oFilter;
      if (sField === "ProductID") {
        let iProductId = parseInt(sText, 10);
        if (isNaN(iProductId)) {
          MessageToast.show("상품 번호는 숫자로 입력하세요.");
          return;
        }
        oFilter = new Filter(sField, FilterOperator.EQ, iProductId);
      } else {
        oFilter = new Filter(sField, FilterOperator.Contains, sText);
      }
      oBinding.filter([oFilter]);
    },

    onRowPress: function (oEvent) {
      let oContext    = oEvent.getSource().getBindingContext();
      let sProductId  = oContext.getProperty("ProductID");
      this.getOwnerComponent().getRouter().navTo("detail", {
        ProductID: sProductId
      });
    }

    });
});