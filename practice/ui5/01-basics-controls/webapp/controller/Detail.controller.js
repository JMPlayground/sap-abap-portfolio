sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"

], function (Controller, MessageBox, JSONModel, Filter, FilterOperator, MessageToast,History) {
    "use strict"; //strict 모드를 사용하겠다는 의미 (잘못된 구문 알려주기 )

    return Controller.extend("ncode.zncl401.controller.Detail", {
        onInit() {

          let oRouter = this.getOwnerComponent().getRouter();
            // 라우터 패턴 매칭 이벤트 리스너 등록: 모듈화(컨트롤러 안의 이벤트 )
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched2, this);
        },

    _onObjectMatched2: function (oEvent) {

            let sStudentIdx   = oEvent.getParameter("arguments").studentIndex;
            let sScoreIdx     = oEvent.getParameter("arguments").scoreIndex;
            let sPath         = "/student/" + sStudentIdx + "/_score/" + sScoreIdx;
            this.getView().bindElement(sPath);
        },
    onNaviBack: function () {
            let oHistory = History.getInstance();
            let sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteView1", {}, true);
            }
        },

        onSave: function () {
            // 1. 현재 화면(Detail)에 연결된 데이터(Context)를 가져옵니다.
            let oContext = this.getView().getBindingContext();
            
            // 2. 바뀐 점수 값을 확인용으로 살짝 읽어옵니다. 
            let sNewScore = oContext.getProperty("score"); 

            // 3. 성공 메시지 알림 띄우기 (MessageToast)
            sap.m.MessageToast.show("점수가 " + sNewScore + "점으로 정상 변경되었습니다.");

            // 4. 저장했으니 아까 만들어둔 뒤로가기 함수를 호출해서 메인 화면으로 돌아갑니다!
            this.onNaviBack();
        }


     });   

    });
    
