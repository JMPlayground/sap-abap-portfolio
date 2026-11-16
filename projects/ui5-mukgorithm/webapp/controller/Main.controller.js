sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",            
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/routing/History",
     "sap/ui/model/json/JSONModel" 


], (Controller,formatter,Filter,FilterOperator,MessageToast,MessageBox,Sorter,NumberFormat,History,JSONModel) => {
    "use strict";

    return Controller.extend("zcl4mukgorithm.zcl4mukgorithm.controller.Main", {
        //상단 define에서 import한 formatter 사용
         formatter: formatter,

        onInit() {

            let oRouter = this.getOwnerComponent().getRouter(); 
            oRouter.getRoute("RouteMain").attachPatternMatched(this._onRouteMatched, this);
              this._oFormModel = new JSONModel({});

        },

        _onRouteMatched: function (oEvent) {
            let sCategory  = oEvent.getParameter("arguments").category;
            let oBinding = this.byId("idStoreList").getBinding("items");

            this.byId("idCategoryChange").setSelectedKey(sCategory);
            

            oBinding.filter([
                 new Filter("Category", FilterOperator.EQ, sCategory)
             ]);


        },

        

        // 콤보박스에서 카테고리를 바꿀시 실행되는 메서드
         onCategoryChange :function(oEvent){
            let selectedCategory = oEvent.getSource().getSelectedKey();
            let oBinding = this.byId("idStoreList").getBinding("items");
            

            if (!selectedCategory) {
                oBinding.filter([]);    // 선택값이 없으면 필터 해제 (전체 보기)
                return;
            }

            
            
            oBinding.filter([
                 new Filter("Category", FilterOperator.EQ, selectedCategory)
             ]);



        },


        onSortPress : function(oEvent){
            let sBtnText = this.byId("idSortBtn").getText();

            //이미 별점 높은 순일 때, 낮은 순으로 desending
            if(sBtnText === '별점낮은순'){
                //sap.ui.model.Sorter의 desending값에 true 지정               
                let oSorter = new sap.ui.model.Sorter("AvgRating",true);
                let aSorter =[];

                aSorter.push(oSorter);
                let oBinding = this.byId("idStoreList").getBinding("items");
                oBinding.sort(aSorter);

                //버튼 상태 바꿔주기
                this.byId("idSortBtn").setText("별점높은순");
                this.byId("idSortBtn").setIcon("sap-icon://sort-descending");
            }else{
                //sap.ui.model.Sorter의 desending값에 false 지정               
                let oSorter = new sap.ui.model.Sorter("AvgRating",false);
                let aSorter =[];

                aSorter.push(oSorter);
                let oBinding = this.byId("idStoreList").getBinding("items");
                oBinding.sort(aSorter);
                
                //버튼 상태 바꿔주기
                this.byId("idSortBtn").setText("별점낮은순");
                this.byId("idSortBtn").setIcon("sap-icon://sort-ascending");
            }
        },



              //리뷰 팝업을 처음에 불러오고 복사본 모델로 연결 
        _getReviewForm :function (){
            if(!this._pReviewForm){
                this._pReviewForm = this.loadFragment({
                    name : "zcl4mukgorithm.zcl4mukgorithm.view.fragment.ReviewForm"
                }).then((oDialog) => { 
                    oDialog.setModel(this._oFormModel);
                    return oDialog;
                });
            }
            return this._pReviewForm;
        },

        //헤더 패널을 눌렀을 때 팝업 여는 로직
        onPanelPress : function(oEvent){
            
            let oContext = oEvent.getSource().getBindingContext();

            this._sReviewPath = oContext.getPath();

            let oCopy =Object.assign({}, oContext.getObject());

            oCopy.Mode = "U";
            
            this._oFormModel.setData(oCopy);

            this._getReviewForm().then(function(oDialog){
                oDialog.open();
            });


        },

        //복사본 생성 후 저장 버튼 누를 때 원본 덮어쓰기
        onFormSave : function(){


            if(!this._validateForm() || !this._validateCreateForm()) {
                return;

            }

            let oModel = this.getView().getModel();
            let oReview = Object.assign({},this._oFormModel.getData());
            let sMode = oReview.Mode;
            delete oReview.Mode;
            oReview.StoreCode = oModel.getProperty(this._sStorePath + "/StoreCode");

            if(sMode ==="C") {
                let aReviews = oModel.getProperty(this._sStorePath + "/Reviews");
                aReviews.push(oReview);
                oModel.setProperty(this._sStorePath + "/Reviews", aReviews);
            }
            else {
                oModel.setProperty(this._sReviewPath, oReview);
            }
            this._recalcStore(this._sStorePath);
            this.byId("idReviewForm").close();
            MessageToast.show("저장했어요");

            
        },

        //팝업 닫기
        onFormCancel : function(){
            this.byId("idReviewForm").close();

        },
        
        //빈칸 예외 처리
        _validateForm : function(){

            let oData = this._oFormModel.getData();

            if(!oData.MenuName || !oData.VisitDate || !oData.Rating) {
                MessageBox.warning("먹은 메뉴 방문 날짜 별점은 꼭 기재해 주세요.");
                return false;

            }
            if(!oData.Price || oData.Price <= 0) {
                MessageBox.warning("메뉴 가격을 입력해 주세요");
                return false;
            }
           
            return true;
            
        },

          onNaviBack: function(){
            let oHistory = History.getInstance();
            let sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                //히스토리가 없으면 manifest에 있는 RouteList route로 네비게이션
                this.getOwnerComponent().getRouter().navTo("RouteHome", {}, true);
            }
        },

          onRepReviewPress: async function (oEvent) {

            // 클릭한 식당의 Context 가져오기
            let oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                return;
            }

            // 예: /Restaurants/0
            this._sStorePath = oContext.getPath();

            // 처음 한 번만 Fragment 로드
            if (!this._pReviewDialog) {
                this._pReviewDialog = this.loadFragment({
                    name: "zcl4mukgorithm.zcl4mukgorithm.view.fragment.ReviewDialog"
                });
            }
            
            let oDialog = await this._pReviewDialog;

            // 선택한 식당의 데이터 연결
            oDialog.bindElement(this._sStorePath);

            // 팝업 상단 글씨 보이게 -> 첫 번째 리뷰가 아니라 하단 작성 버튼에 포커스
            oDialog.setInitialFocus(this.byId("idCreateBtn"));

            // 리뷰 팝업 열기
            oDialog.open();
        },


        // ===== 리뷰 팝업 닫기 =====

        onReviewDialogClose: function () {

            this.byId("idReviewDialog").close();

        },


        // ===== 리뷰 생성 버튼 =====

        onCreatePress: async function () {

            let oModel = this.getView().getModel();

            // 현재 식당의 리뷰 목록
            let aReviews = oModel.getProperty(
                this._sStorePath + "/Reviews"
            ) || [];

            // 가장 큰 MenuCode 찾기
            let iMaxCode = 0;

            aReviews.forEach(function (oReview) {

                let iCode = parseInt(
                    oReview.MenuCode.slice(1),
                    10
                );

                if (iCode > iMaxCode) {
                    iMaxCode = iCode;
                }
            });

            // M03 → M04
            let sNewCode = "M" +
                String(iMaxCode + 1).padStart(2, "0");

            // 오늘 날짜 yyyy-MM-dd
            let oToday = new Date();

            let sToday =
                oToday.getFullYear() + "-" +
                String(oToday.getMonth() + 1).padStart(2, "0") + "-" +
                String(oToday.getDate()).padStart(2, "0");

            // 생성 모드로 입력 모델 초기화
            this._oFormModel.setData({
                Mode: "C",
                MenuCode: sNewCode,
                VisitDate: sToday,
                MenuName: "",
                Rating: 0,
                Price: 0,
                ReviewText: ""
            });

            this._sReviewPath = "";

            // 예외 처리 

            // ReviewForm 팝업 열기
            await this._openReviewForm();
        },

        // ===== 입력 팝업 공통 함수 =====
        _openReviewForm: async function () {
            if (!this._pReviewForm) {

                this._pReviewForm = this.loadFragment({
                    name: "zcl4mukgorithm.zcl4mukgorithm.view.fragment.ReviewForm"
                }).then((oDialog) => {

                    // 입력 폼에만 복사본 모델 연결
                    oDialog.setModel(this._oFormModel);
                    return oDialog;
                });
            }
            let oDialog = await this._pReviewForm;
            oDialog.open();
        },

            
        //----------------------------------------------------------------
        // [공통] 가게 하나의 평균·대표리뷰 다시 계산 (생성·수정 저장 후 호출)
        //----------------------------------------------------------------
        _recalcStore: function (sStorePath) {
            const oModel = this.getOwnerComponent().getModel();
            const aReviews = oModel.getProperty(sStorePath + "/Reviews");

            oModel.setProperty(sStorePath + "/AvgRating", formatter.averageRating(aReviews));
            oModel.setProperty(sStorePath + "/RepReview", formatter.repReview(aReviews));   
            oModel.setProperty(sStorePath + "/RepRating", formatter.repRating(aReviews));
        },

        // ===== [팀원] 리뷰 생성 예외처리 =====
        _validateCreateForm: function () {

            let oData = this._oFormModel.getData();

            // 1. 방문일자 검사
            let sDate = String(oData.VisitDate || "").trim();

            // yyyy-MM-dd 형식인지 확인
            if (!/^\d{4}-\d{2}-\d{2}$/.test(sDate)) {
                MessageBox.warning("올바른 방문일자를 입력해주세요.");
                return false;
            }

            let aDate = sDate.split("-").map(Number);

            let iYear = aDate[0];
            let iMonth = aDate[1];
            let iDay = aDate[2];

            // 실제 존재하는 날짜인지 확인
            let oVisitDate = new Date(0);
            oVisitDate.setFullYear(iYear, iMonth - 1, iDay);
            oVisitDate.setHours(0, 0, 0, 0);

            if (
                iYear < 1 ||
                oVisitDate.getFullYear() !== iYear ||
                oVisitDate.getMonth() !== iMonth - 1 ||
                oVisitDate.getDate() !== iDay
            ) {
                MessageBox.warning("존재하지 않는 날짜입니다.");
                return false;
            }

            // 미래 날짜인지 확인
            let oToday = new Date();
            oToday.setHours(0, 0, 0, 0);

            if (oVisitDate > oToday) {
                MessageBox.warning(
                    "방문일자는 오늘 또는 과거 날짜만 선택할 수 있습니다."
                );
                return false;
            }

            // 2. 리뷰 글자 수 검사
            let sReview = String(oData.ReviewText || "");

            if (sReview.length > 200) {
                MessageBox.warning(
                    "리뷰는 200자 이내로 작성해주세요."
                );
                return false;
            }

            // 3. 메뉴 가격 검사
            let nPrice = Number(oData.Price);

            if (!Number.isFinite(nPrice) || nPrice <= 0) {
                MessageBox.warning(
                    "메뉴 가격은 0원보다 커야 합니다."
                );
                return false;
            }

            return true;
        }


    });
});