sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter"

], function (Controller, MessageBox, JSONModel, Filter, FilterOperator, MessageToast,Sorter) {
    "use strict"; //strict 모드를 사용하겠다는 의미 (잘못된 구문 알려주기 )

    return Controller.extend("ncode.zncl401.controller.View4", {
        onInit() {

            let oView  = this.getView(); 
            let oModel = new JSONModel();
            oModel.loadData(
                sap.ui.require.toUrl("ncode/zncl401/model/customers2.json")
            );
            this.getView().setModel(oModel);

            },

            onRowSelectionChange: function (oEvent) {
               
            // 선택된 Row의 정보를 읽는다
            let oView  = this.getView(); 
            let oRowContext   = oEvent.getParameter("rowContext");

            // 선택된 ROw의 정보로 모델의 정보를 취득한다. + 예외처리(취소했을때)
            if (!oRowContext) {
                return;
            }
            // 1. ! >>> 중복 생성을 방지하기 위해 인스턴스가 없을 때만 [최초 1회] 로드합니다.
            // popup fragment를 담아두기 위한 클래스 레벨의 내부변수 (private) : 변수 다르게 설정
            if (!this._pDialog) {
                this._pDialog = this.loadFragment({
                    id: oView.getId(),
                    name: "ncode.zncl401.view.Popup4",
                    controller: this
                    }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

        
            // 팝업 오픈 및 데이터 바인딩
            this._pDialog.then(function (oDialog) {
                // 선택된 Row의 데이터 경로 Context를 팝업창 전체에 바인딩(Element Binding)
                oDialog.setBindingContext(oRowContext);
                oDialog.open();
            });
          
          

        },

            onClose: function (oEvent) {   
         
                // 1번 방법. Fragment 내부에서 정의된 Dialog ID를 찾아 모달창을 닫습니다. this.byId("idPopup").close(); //각자 수정
         // 2번 방법 Fragment 내부에서 정의된 Dialog ID를 찾아 모달창을 닫습니다.
         
        let oDialog = oEvent.getSource().getParent();
        if(oDialog){
            oDialog.close();
            };
        
       },

       formatPhone: function (sPhone) {
            if (!sPhone) {
                return "";
            }

            return sPhone.replace(
                /^(\d{3})(\d{4})(\d{4})$/,
                "$1-$2-$3"
            );
        },

        onFilter: function () {   
        
        // 1. Select 박스에서 선택한 값 가져오기 ("", "성인", "미성년자")
        let sStatusKey = this.byId("filterStatus").getSelectedKey();

        let aFilters = [];
        
        // 3. '전체'가 아니라 성인/미성년자를 선택했을 때만 필터 조건 추가
        if (sStatusKey !== "") {
        aFilters.push(new Filter("adultStatus", FilterOperator.EQ, sStatusKey));
        
        }

        // 4. 테이블(t:Table)에 필터 적용 ("rows" 사용)
        
        let oTable         = this.byId("idTableCustomers");
        let oBinding       = oTable.getBinding("rows");
            oBinding.filter(aFilters);

    
    
       },
        
        onSortName: function () {   
        
        // 1. this 주머니에 상태 저장! 누를 때마다 true -> false -> true 로 바뀜
        this._bFlag1 = !this._bFlag1;

        // 2. if문 없이, 저장된 상태(this._bSortNameDesc)를 바로 꽂아줍니다!
       let oSorter = new Sorter("name", this._bFlag1);
       let aSorter = [];
       
       aSorter.push(oSorter);

      let oTable    = this.byId("idTableCustomers");
      let oBinding  = oTable.getBinding("rows");
      oBinding.sort(aSorter)

    
        
       },
       

        onSortAge: function () {   
         
            // 1. this 주머니에 상태 저장! 누를 때마다 true -> false -> true 로 바뀜
         this._bFlag2 = !this._bFlag2;

        // 2. if문 없이, 저장된 상태(this._bSortNameDesc)를 바로 꽂아줍니다!
     let oSorter = new Sorter("age", this._bFlag2);
     let aSorter = [];
       
       aSorter.push(oSorter);

      let oTable    = this.byId("idTableCustomers");
      let oBinding  = oTable.getBinding("rows");
      oBinding.sort(aSorter)
  
   
        
       },

       formatDate: function (sDate) {
    if (!sDate) return "";
    // 원본 데이터가 "20261026" 같은 8자리 문자열일 경우 yyyy/MM/dd 로 조합
    if (sDate.length === 8) {
        return sDate.substring(0, 4) + "/" + sDate.substring(4, 6) + "/" + sDate.substring(6, 8);
    }
    // 원본이 "2026-10-26" 같은 형태라면 하이픈만 슬래시로 변경
    return sDate.replace(/-/g, "/"); 
},

formatPrice: function (sPrice) {
    if (!sPrice) return "";
    // 데이터를 숫자로 강제 변환한 뒤 콤마를 찍고 '원' 붙이기
    return Number(sPrice).toLocaleString() + " 원";
},

formatPurchaseCount: function (aList) {
    // 구매 내역 배열이 없거나 비어있으면 0 건 반환
    if (!aList || !Array.isArray(aList)) {
        return "0 건";
    }
    // 배열의 길이(건수)를 리턴
    return aList.length + " 건";
}



    });
});
