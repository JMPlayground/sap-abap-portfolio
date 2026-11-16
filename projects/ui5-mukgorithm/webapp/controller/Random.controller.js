sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "zcl4mukgorithm/zcl4mukgorithm/model/formatter"

], (Controller,MessageToast,formatter) => {
    "use strict";

    return Controller.extend("zcl4mukgorithm.zcl4mukgorithm.controller.Random", {
        formatter: formatter,

//----------------------------------------------------------------
// [정민] 초기화
//----------------------------------------------------------------
        onInit() {
            this._iTimer = null;     //setInterval id (멈출 때 사용)
            this._aCandidates = []; //후보 가게 index 목록
            this._iStopTimer = null;   // setTimeout id (2초 뒤 멈추는 타이머)
            this._pReviewDialog = null;   // 리뷰 팝업 (처음 한 번만 로드)

        // 슬롯 이미지: 앱 기준 경로로 지정 (런치패드 미리보기에서도 뜸)
    this.byId("idSlotImg").setSrc(
        sap.ui.require.toUrl("zcl4mukgorithm/zcl4mukgorithm/img/logo.png")
    );    

        },

//----------------------------------------------------------------
// [정민] 뒤로가기
//----------------------------------------------------------------
        onNavBack() {
            clearInterval(this._iTimer);
            clearTimeout(this._iStopTimer);
            this.byId("idSlotImg").removeStyleClass("mkSpin");
            this.byId("idSpinBtn").setEnabled(true);
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

//----------------------------------------------------------------
// [정민] 모드 전환: 날씨추천일 때만 날씨 버튼 보이기
//----------------------------------------------------------------
        onModeChange() {
            // WEATHER면 날씨 버튼 보이기, 아니면 숨기기 + 결과 카드 숨기기
            let sModeKey = this.getView().byId("idRandomMode").getSelectedKey()
                
            if(sModeKey === "WEATHER"){
                 this.byId("idWeatherSelect").setVisible(true)}
            else{this.byId("idWeatherSelect").setVisible(false)}

                       this.byId("idResultBox").setVisible(false)
                       this.byId("idSlotText").setText("오늘의 메뉴는?");
        },

//----------------------------------------------------------------
// [정민] 돌리기: 0.08초마다 이름 바꾸다가 2초 뒤 멈춤
//----------------------------------------------------------------
        onSpinPress() {
            // 후보 구하기 → 0.08초마다 이름 바꾸기 → 2초 뒤 _stopSpin
            this._aCandidates = this._getCandidates();
            if (this._aCandidates.length === 0) {
                MessageToast.show("추천할 가게가 없어요");
                return;
            }

            const aStores = this.getOwnerComponent().getModel().getProperty("/Restaurants");

            // 2. 돌리는 동안 버튼 막고 이전 결과 숨기기
            this.byId("idSpinBtn").setEnabled(false);

            this.byId("idSlotImg").addStyleClass("mkSpin");

            this.byId("idResultBox").setVisible(false);

            // 3. 0.08초마다 후보 중 아무 가게 이름 보여주기
            clearInterval(this._iTimer);
            this._iTimer = setInterval(() => {
                const iRandom = this._aCandidates[Math.floor(Math.random() * this._aCandidates.length)];
                this.byId("idSlotText").setText(aStores[iRandom].StoreName);
            }, 80);

            // 4. 2초 뒤 최종 1곳 뽑아서 멈추기
            this._iStopTimer = setTimeout(() => {
                const iFinal = this._aCandidates[Math.floor(Math.random() * this._aCandidates.length)];
                this._stopSpin(iFinal);
            }, 2000);

        },

//----------------------------------------------------------------
// [정민] 후보 목록: 완전랜덤 80곳 / 날씨추천은 날씨코드 같은 가게만
//----------------------------------------------------------------

        _getCandidates() {
            // ALL: 80곳 전부 / WEATHER: 고른 날씨코드인 가게 index만
            const aStores = this.getOwnerComponent().getModel().getProperty("/Restaurants") || [];
            const sMode = this.byId("idRandomMode").getSelectedKey();
            const sWeather = this.byId("idWeatherSelect").getSelectedKey();
            const aIndex = [];

            aStores.forEach((oStore, i) => {
                // 완전랜덤이면 전부, 날씨추천이면 날씨코드가 같은 가게만
                if (sMode === "ALL" || oStore.WeatherCode === sWeather) {
                    aIndex.push(i);
                }
            });

            return aIndex;
        
        },

//----------------------------------------------------------------
// [정민] 멈추기: 최종 이름 표시 + 결과 카드 연결
//----------------------------------------------------------------        
        _stopSpin(iIndex) {
            // 타이머 멈추기 → 이름 표시 → 결과 카드 bindElement + 보이기
            clearInterval(this._iTimer);
            this._iTimer = null;

            const sPath = "/Restaurants/" + iIndex;
            const oModel = this.getOwnerComponent().getModel();

            // 최종 이름 표시
            this.byId("idSlotText").setText(oModel.getProperty(sPath + "/StoreName"));

            // 결과 카드에 이 가게 연결 → 안의 {StoreName}, {ImageUrl} 등이 이 가게를 가리킴
            const oBox = this.byId("idResultBox");
            oBox.bindElement(sPath);
            oBox.setVisible(true);

            this.byId("idSlotImg").removeStyleClass("mkSpin");
            this.byId("idSpinBtn").setEnabled(true);

        },

 //----------------------------------------------------------------
// [정민] 결과 카드 클릭 → 리뷰 팝업 바로 열기 (보기 전용)
//----------------------------------------------------------------
        onResultPress() {
            const sPath = this.byId("idResultBox").getBindingContext().getPath();

            if (!this._pReviewDialog) {
                this._pReviewDialog = this.loadFragment({
                    name: "zcl4mukgorithm.zcl4mukgorithm.view.fragment.ReviewDialog"
                });
            }
            this._pReviewDialog.then((oDialog) => {
                oDialog.bindElement(sPath);                    // 이 가게 리뷰로 연결
                this.byId("idCreateBtn").setVisible(false);    // 랜덤에선 생성 버튼 숨김
                oDialog.open();
            });
        },

        onReviewDialogClose() {
            this.byId("idReviewDialog").close();
        },

        // 팝업 안 이벤트 연결용 (없으면 팝업 로드할 때 에러)
        onCreatePress() {},

        onPanelPress() {
            MessageToast.show("리뷰 수정은 메인 화면에서 할 수 있어요");
        }

    });
});