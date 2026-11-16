sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, Filter, FilterOperator, Sorter) {
    "use strict";

    return Controller.extend("ncode.zncl040203.controller.GridList", {

        onInit: function () {
            this._bSortNameDesc = false;
            this._bSortAgeDesc  = false;
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
        },

        // ==================================================================
        // [G1] 행 선택 → 팝업 : t:Table 은 "rowContext" 파라미터
        // ==================================================================
        onRowSelectionChange: function (oEvent) {
            let oTable          = oEvent.getSource();
            let oRowContext     = oEvent.getParameter("rowContext");

            // [예외] 선택 해제(clearSelection) 때도 이벤트가 발생 → 선택된 행 없으면 종료
            if (!oRowContext || oTable.getSelectedIndex() === -1) {
                return;
            }

            if (!this._pDialog) {
                this._pDialog = this.loadFragment({
                    name    : "ncode.zncl040203.view.CustomerPopup"
                });
            }

            this._pDialog.then(function (oDialog) {
                oDialog.setBindingContext(oRowContext);
                oDialog.open();
            });
        },

        // 팝업 닫기 + 선택 해제 (같은 행 다시 눌러도 팝업 뜨게)
        onClose: function () {
            this.byId("dlgCustomer").close();
            this.byId("idGridTable").clearSelection();
        },

        // ==================================================================
        // [G2] 필터 : SearchField(이름) + Select(구분) 동시 적용
        // ==================================================================
        onFilter: function () {
            let sName       = this.byId("sfName").getValue().trim();
            let sStatus     = this.byId("selStatus").getSelectedKey();
            let aFilters    = [];

            if (sName) {
                aFilters.push(new Filter("name", FilterOperator.Contains, sName));
            }
            if (sStatus !== "") {
                aFilters.push(new Filter("adultStatus", FilterOperator.EQ, sStatus));
            }

            // ★ t:Table = "rows"
            this.byId("idGridTable").getBinding("rows").filter(aFilters);
        },

        // ==================================================================
        // [G3] 정렬
        // ==================================================================
        onSortName: function () {
            let oSorter = new Sorter("name", this._bSortNameDesc);
            this.byId("idGridTable").getBinding("rows").sort([oSorter]);
            this._bSortNameDesc = !this._bSortNameDesc;
        },

        onSortAge: function () {
            let oSorter = new Sorter("age", this._bSortAgeDesc);
            this.byId("idGridTable").getBinding("rows").sort([oSorter]);
            this._bSortAgeDesc = !this._bSortAgeDesc;
        },

        // ==================================================================
        // [G4] Formatter (팝업 Fragment 에서도 사용)
        // ==================================================================
        formatPhone: function (sPhone) {
            if (!sPhone) {
                return "";
            }
            return String(sPhone).replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
        },

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

        formatCount: function (aList) {
            if (!Array.isArray(aList)) {
                return "0 건";
            }
            return aList.length + " 건";
        }
    });
});