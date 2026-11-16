sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/base/i18n/Localization"
], function (Controller, Filter, FilterOperator, Sorter, MessageBox, MessageToast, Localization) {
    "use strict"; // strict 모드 : 잘못된 구문을 에러로 알려줌

    // ★ 위 배열(경로)과 아래 function 매개변수는 "순서·개수" 1:1 짝꿍!

    return Controller.extend("ncode.zncl040203.controller.List", {

        // ==================================================================
        // [L0] onInit : 화면이 처음 만들어질 때 1회 실행
        // ==================================================================
        onInit: function () {
            // this._변수 = 화면이 살아있는 동안 기억 (let 은 함수 끝나면 사라짐)
            this._bSortNameDesc = false;   // false = 오름차순부터 시작
            this._bSortAgeDesc  = false;

            // ----- (선택) 처음 화면에 데이터 안 보이게 하기 : 요구사항에 있으면 주석 해제 -----
            // let oTable = this.byId("idCustomerTable");
            // oTable.attachEventOnce("updateFinished", function () {
            //     let oBinding = oTable.getBinding("items");
            //     if (oBinding) {
            //         oBinding.filter([ new Filter("name", FilterOperator.EQ, "") ]);
            //     }
            // });
        },

        // ==================================================================
        // [L0] 화면 이동 (라우팅) : manifest.json routes 의 name 사용
        // ==================================================================
        onGoBasic: function () {
            this.getOwnerComponent().getRouter().navTo("RouteBasic");
        },

        onGoGrid: function () {
            this.getOwnerComponent().getRouter().navTo("RouteGrid");
        },

        // ==================================================================
        // [L5] 언어 전환 : ko ↔ en (i18n_ko.properties ↔ i18n.properties)
        //      {i18n>키} 로 바인딩된 글자는 자동으로 바뀜
        // ==================================================================
        onToggleLang: function () {
            let sLang = Localization.getLanguage().startsWith("ko") ? "en" : "ko";
            Localization.setLanguage(sLang);
        },

        // ==================================================================
        // [L1] 검색 (Filter) : 조건 → Filter 배열 → binding.filter()
        // ==================================================================
        onSearch: function () {
            let oCombo      = this.byId("cbStatus");
            let sName       = this.byId("inpName").getValue().trim();   // trim : 앞뒤 공백 제거
            let sStatus     = oCombo.getSelectedKey();

            // [예외] ComboBox 에 목록에 없는 글자를 직접 친 경우 → key 가 "" 로 나옴
            if (oCombo.getValue() && !sStatus && oCombo.getValue() !== "전체") {
                MessageToast.show("구분은 목록에서 선택해 주세요.");
                return;
            }

            // [예외] 필수 조건이 있는 문제라면 여기서 막기 (요구사항에 없으면 삭제)
            // if (!sName) {
            //     MessageBox.warning("이름을 입력해 주세요.");
            //     return;
            // }

            let aFilters    = [];

            // 값이 있을 때만 조건 추가 (빈 값으로 필터하면 0건 나옴!)
            if (sName) {
                aFilters.push(new Filter("name", FilterOperator.Contains, sName));        // 포함
            }
            if (sStatus) {
                aFilters.push(new Filter("adultStatus", FilterOperator.EQ, sStatus));     // 완전 일치
            }

            let oTable      = this.byId("idCustomerTable");
            let oBinding    = oTable.getBinding("items");      // m.Table = "items" / t:Table = "rows"

            oBinding.filter(aFilters);                         // 빈 배열 [] = 필터 해제(전체)

            let iCount      = oBinding.getLength();             // 필터 후 건수

            // [예외] 결과 없음
            if (iCount === 0) {
                MessageBox.information("검색 결과가 없습니다.");
            } else {
                // [L5] i18n 텍스트 읽기 : {0} 자리에 iCount 가 들어감
                let oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                MessageToast.show(oBundle.getText("msgCount", [iCount]));
            }

            // 검색하면 이전 선택/하위 테이블 초기화
            oTable.removeSelections(true);
            this.byId("idPurchaseTable").setBindingContext(null);
        },

        // ==================================================================
        // [L1] 초기화 : 입력값 + 필터 + 선택 상태 모두 원래대로
        // ==================================================================
        onReset: function () {
            let oTable      = this.byId("idCustomerTable");

            this.byId("inpName").setValue("");
            this.byId("cbStatus").setSelectedKey("");
            this.byId("cbStatus").setValue("");

            // ★ 순서 주의 : sort([]) 먼저 → filter([]) 해야 원래 순서로 돌아옴
            oTable.getBinding("items").sort([]);
            oTable.getBinding("items").filter([]);
            this._bSortNameDesc = false;
            this._bSortAgeDesc  = false;
            oTable.removeSelections(true);
            this.byId("idPurchaseTable").setBindingContext(null);

            MessageToast.show("초기화되었습니다.");
        },

        // ==================================================================
        // [L2] 메인 테이블 행 선택 → 하위 테이블에 Context 연결 (Master-Detail)
        // ==================================================================
        onCustomerSelect: function (oEvent) {

        },

        // ==================================================================
        // [L3] 하위 테이블 행 선택 → Detail 화면으로 이동 (라우팅 + 파라미터)
        // ==================================================================
        onPurchaseSelect: function (oEvent) {
            let oItem       = oEvent.getParameter("listItem");
            if (!oItem) {
                return;
            }

            // getPath() = "/customers/0/_purchaseList/1"
            // split("/") = ["", "customers", "0", "_purchaseList", "1"]
            let sPath       = oItem.getBindingContext().getPath();
            let aPath       = sPath.split("/");

            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                customerIndex   : aPath[2],     // ★ 키 이름 = manifest pattern 의 {customerIndex}
                purchaseIndex   : aPath[4]
            });

            // 돌아왔을 때 선택 상태가 남아있지 않도록 해제
            oEvent.getSource().removeSelections(true);
        },

        // ==================================================================
        // [L4] 정렬 (Sorter) : 누를 때마다 오름 ↔ 내림
        // ==================================================================
        onSortName: function () {
            let oBinding    = this.byId("idCustomerTable").getBinding("items");
            let oSorter     = new Sorter("name", this._bSortNameDesc);   // (필드, 내림차순여부)

            oBinding.sort([oSorter]);
            this._bSortNameDesc = !this._bSortNameDesc;                  // 다음 클릭은 반대로
        },

        onSortAge: function () {
            let oBinding    = this.byId("idCustomerTable").getBinding("items");
            let oSorter     = new Sorter("age", this._bSortAgeDesc);

            oBinding.sort([oSorter]);
            this._bSortAgeDesc = !this._bSortAgeDesc;
        },

        // ==================================================================
        // [L6] Fragment 팝업 : 선택된 행 데이터를 Dialog 에 바인딩
        // ==================================================================
        onOpenPopup: function () {
            let oItem       = this.byId("idCustomerTable").getSelectedItem();

            // [예외] 선택 안 하고 버튼 누른 경우
            if (!oItem) {
                MessageToast.show("고객을 먼저 선택해 주세요.");
                return;
            }

            let oContext    = oItem.getBindingContext();

            // 최초 1회만 로드 (중복 생성 방지) → this._pDialog 에 Promise 저장
            // ★ name 은 "네임스페이스.view.파일명" (뒤에 .fragment 붙이지 말 것)
            if (!this._pDialog) {
                this._pDialog = this.loadFragment({
                    name    : "ncode.zncl040203.view.CustomerPopup"
                });
            }

            this._pDialog.then(function (oDialog) {
                oDialog.setBindingContext(oContext);   // Element(Context) 바인딩
                oDialog.open();
            });
        },

        // 팝업 닫기 (Fragment 안의 버튼 press=".onClose")
        onClose: function () {
            this.byId("dlgCustomer").close();          // loadFragment 사용 시 this.byId 로 찾기 가능
        },

        // ==================================================================
        // [L9] Formatter : 화면에 보여줄 값만 가공 (원본 데이터는 그대로)
        //      XML : { path : '필드', formatter : '.함수명' }
        // ==================================================================
        formatPhone: function (sPhone) {
            if (!sPhone) {
                return "";
            }
            // 숫자 11자리 → 3-4-4 (형식이 다르면 원본 그대로)
            return String(sPhone).replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
        },

        formatDate: function (sDate) {
            if (!sDate || String(sDate).length !== 8) {
                return sDate || "";
            }
            // "20261002" → "2026/10/02"
            return sDate.substring(0, 4) + "/" + sDate.substring(4, 6) + "/" + sDate.substring(6, 8);
        },

        formatPrice: function (vPrice) {
            if (vPrice === null || vPrice === undefined || isNaN(Number(vPrice))) {
                return "";
            }
            // 29000 → "29,000 원"
            return Number(vPrice).toLocaleString() + " 원";
        },

        formatAmount: function (iQty, iPrice) {
            if (isNaN(Number(iQty)) || isNaN(Number(iPrice))) {
                return "";
            }
            return (Number(iQty) * Number(iPrice)).toLocaleString() + " 원";
        },

        formatCount: function (aList) {
            if (!Array.isArray(aList)) {
                return "0 건";
            }
            return aList.length + " 건";
        }
    });
});