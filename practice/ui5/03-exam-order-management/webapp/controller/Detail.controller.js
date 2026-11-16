sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "ncode/zncl0402ljm/model/formatter"
], function (Controller, History, JSONModel, MessageBox, MessageToast, formatter) {
    "use strict";

    // 위 배열(경로)과 아래 function 매개변수는 "순서·개수" 1:1 짝꿍!

    return Controller.extend("ncode.zncl0402ljm.controller.Detail", {

        formatter: formatter,

        // ==================================================================
        // onInit : "detail" 라우트로 들어올 때마다 _onObjectMatched 실행 등록
        // ==================================================================
        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("detail")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        // ==================================================================
        // URL 의 OrderID → /Orders 배열 index 찾기 → View 전체 Context Binding
        // ==================================================================
        _onObjectMatched: function (oEvent) {
            const sOrderID = oEvent.getParameter("arguments").OrderID;
            const oModel   = this.getOwnerComponent().getModel();

            // JSON 로드 완료 후 검색 (상세에서 새로고침 대비)
            oModel.dataLoaded().then(function () {
                const aOrders = oModel.getProperty("/Orders") || [];
                const iIndex  = aOrders.findIndex(function (oOrder) {
                    return oOrder.OrderID === sOrderID;
                });

                // [예외] 없는 OrderID → URL 은 그대로 두고 NotFound 화면만 표시
                if (iIndex === -1) {
                    this.getOwnerComponent().getRouter().getTargets().display("notFound");
                    return;
                }

                this.getView().bindElement("/Orders/" + iIndex);      // 예: /Orders/8
                this.byId("idItemTable").removeSelections(true);      // 이전 오더 체크 해제
            }.bind(this));
        },

        // ==================================================================
        // 뒤로가기 : 브라우저 History → 목록의 검색 조건 · 스크롤 유지
        // ==================================================================
        onNavBack: function () {
            if (History.getInstance().getPreviousHash() !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
            }
        },

        // ==================================================================
        // 생산 상태 변경
        //   시작 01 → 02 / 완료 02 → 03 / 보류 01·02 → 09 / 재개 09 → 01
        // ==================================================================
        onStart: function () {
            this._changeStatus(["01"], "02", "생산이 시작되었습니다.");
        },

        onComplete: function () {
            MessageBox.confirm("생산을 완료 처리할까요?\n완료 후에는 품목을 변경할 수 없습니다.", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._changeStatus(["02"], "03", "생산이 완료되었습니다.");
                    }
                }.bind(this)
            });
        },

        onHold: function () {
            this._changeStatus(["01", "02"], "09", "보류 처리되었습니다.");
        },

        onResume: function () {
            this._changeStatus(["09"], "01", "계획 상태로 재개되었습니다.");
        },

        // 공통 : 현재 Context 경로 + "/Status" 에 setProperty → 폼 · 버튼 · List 자동 갱신
        _changeStatus: function (aFrom, sTo, sMsg) {
            const oContext = this.getView().getBindingContext();

            // [예외] 바인딩 안 됨
            if (!oContext) {
                MessageBox.error("선택된 생산 오더가 없습니다.");
                return;
            }

            // [예외] 버튼 enabled 로 막지만 이중 체크
            if (aFrom.indexOf(oContext.getProperty("Status")) === -1) {
                MessageBox.warning("현재 상태에서는 처리할 수 없습니다.");
                return;
            }

            oContext.getModel().setProperty(oContext.getPath() + "/Status", sTo);    // /Orders/n/Status
            MessageToast.show(oContext.getProperty("OrderID") + " : " + sMsg);
        },

        // ==================================================================
        // 품목 추가 : 팝업(처음 한 번만 로드) → 입력 → 검증 → _Items 에 추가
        // ==================================================================
        onAddItem: function () {
            if (!this._pItemDialog) {
                this._pItemDialog = this.loadFragment({
                    name: "ncode.zncl0402ljm.view.ItemDialog"
                });
            }

            this._pItemDialog.then(function (oDialog) {
                // 열 때마다 입력값 초기화
                oDialog.setModel(new JSONModel({
                    Material: "", MaterialName: "", Category: "", Unit: "EA",
                    PlannedQty: "", RequiredQty: "", AvailableStock: "",
                    StartDate: "", DueDate: "", Description: ""
                }), "newItem");
                oDialog.open();
            });
        },

        onSaveItem: function () {
            const oDialog  = this.byId("itemDialog");
            const oNew     = oDialog.getModel("newItem").getData();
            const oContext = this.getView().getBindingContext();

            // [예외] 필수값
            if (!oNew.Material.trim() || !oNew.MaterialName.trim() || !oNew.Unit.trim()) {
                MessageBox.warning("자재 번호 · 자재명 · 단위는 필수입니다.");
                return;
            }
            if (!(Number(oNew.PlannedQty) > 0) || !(Number(oNew.RequiredQty) >= 0)) {
                MessageBox.warning("계획 수량은 0보다 크고, 필요 수량은 0 이상이어야 합니다.");
                return;
            }
            if (!oNew.StartDate || !oNew.DueDate || oNew.StartDate > oNew.DueDate) {
                MessageBox.warning("시작일과 납기일을 확인해 주세요. (납기일 ≥ 시작일)");
                return;
            }

            const sItemsPath = oContext.getPath() + "/_Items";
            const aItems     = oContext.getModel().getProperty(sItemsPath) || [];

            // [예외] 같은 오더 안에서 자재 번호 중복
            const bDup = aItems.some(function (oItem) {
                return oItem.Material === oNew.Material.trim();
            });
            if (bDup) {
                MessageBox.warning("이미 등록된 자재 번호입니다.");
                return;
            }

            // 새 배열로 교체해야 바인딩 · 표현식(품목 수)이 갱신됨
            oContext.getModel().setProperty(sItemsPath, aItems.concat([{
                Material:       oNew.Material.trim(),
                MaterialName:   oNew.MaterialName.trim(),
                Category:       oNew.Category.trim(),
                Unit:           oNew.Unit.trim(),
                PlannedQty:     Number(oNew.PlannedQty),
                RequiredQty:    Number(oNew.RequiredQty),
                AvailableStock: Number(oNew.AvailableStock) || 0,
                StartDate:      oNew.StartDate,
                DueDate:        oNew.DueDate,
                Description:    oNew.Description.trim()
            }]));

            oDialog.close();
            MessageToast.show(oNew.MaterialName + " 품목이 추가되었습니다.");
        },

        onCancelItem: function () {
            this.byId("itemDialog").close();
        },

        // ==================================================================
        // 선택 삭제 : 체크한 행의 index 를 모아 한 번에 제거 (확인 팝업)
        // ==================================================================
        onDeleteItems: function () {
            const oTable    = this.byId("idItemTable");
            const aSelected = oTable.getSelectedContexts();

            if (aSelected.length === 0) {
                MessageToast.show("삭제할 품목을 선택해 주세요.");
                return;
            }

            MessageBox.confirm(aSelected.length + "건의 품목을 삭제할까요?", {
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.OK) {
                        return;
                    }

                    const oContext   = this.getView().getBindingContext();
                    const sItemsPath = oContext.getPath() + "/_Items";
                    const aItems     = oContext.getModel().getProperty(sItemsPath);

                    // "/Orders/3/_Items/2" → 2
                    const aDelIndex = aSelected.map(function (oCtx) {
                        return Number(oCtx.getPath().split("/").pop());
                    });

                    oContext.getModel().setProperty(sItemsPath, aItems.filter(function (oItem, i) {
                        return aDelIndex.indexOf(i) === -1;
                    }));

                    oTable.removeSelections(true);
                    MessageToast.show(aDelIndex.length + "건이 삭제되었습니다.");
                }.bind(this)
            });
        }
    });
});
