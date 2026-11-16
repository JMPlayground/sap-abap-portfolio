sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
],
    function (Controller, MessageBox, JSONModel) {
        "use strict"; //strict 모드를 사용하겠다는 의미 (잘못된 구문 알려주기 )

        return Controller.extend("ncode.zncl401.controller.View3", {
            onInit() {
                let oData = {
                gender: "M",
                genderList: [
                    { key: "M", text: "남성" },
                    { key: "F", text: "여성" }
                ],

                major: "Y",
                majorList: [
                    { key: "Y", text: "전공자" },
                    { key: "N", text: "비전공자" }
                ],

                careerIndex: 3,
                careerList: [
                    { text: "ABAP 개발자" },
                    { text: "Fiori/UI5 개발자" },
                    { text: "아직 미정" },
                    { text: "축구선수" },
                ]
                      //JSON모델 생성 및 데이터 세팅

            };
            let oModel = new JSONModel(oData);

            this.getView().setModel(oModel); //aggregation Binding  

            },


            onRegister: function () {
                debugger;
                let oView    = this.getView();
                let oArea    = oView.byId("result")

                let sName    = (oView.byId("name").getValue());
                let sGender  = (oView.byId("gender").getSelectedItem().getText());
                let sMajor   = (oView.byId("major").getSelectedItem().getText());
                let sAddress  = (oView.byId("address").getValue());

                let sHobby   = (oView.byId("hobby").getValue());
                let sMenu    = (oView.byId("menu").getValue());
                let sCareer  = (oView.byId("career").getSelectedButton().getText());

                let sResult1 = "" 
                
                sResult1 = "이름: " + sName + "\n" + "성별: " + sGender + "\n" + "전공: " + sMajor + "\n"
                 + "주소: " + sAddress + "\n" + "취미: " + sHobby + "\n" + "메뉴: " + sMenu + "\n" + "커리어: " + sCareer  


                oArea.setValue(sResult1);


            },

            onPopup: function () {
            // 1. ! >>> 중복 생성을 방지하기 위해 인스턴스가 없을 때만 [최초 1회] 로드합니다.
            // popup fragment를 담아두기 위한 클래스 레벨의 내부변수 (private) : 언더바를 붙여야함. 
            if (!this._pDialog) {
                this._pDialog = this.loadFragment({
                    name: "ncode.zncl401.view.Popup2"
                });
            }

            // 2. 비동기 로드가 완료되면 팝업 창을 활성화합니다.
            this._pDialog.then(function (oPopup) {
                oPopup.open();
            });
        },

        onPopup2: function () {
            // 1. ! >>> 중복 생성을 방지하기 위해 인스턴스가 없을 때만 [최초 1회] 로드합니다.
            // popup fragment를 담아두기 위한 클래스 레벨의 내부변수 (private) : 변수 다르게 설정
            if (!this._pDialog2) {
                this._pDialog2 = this.loadFragment({
                    name: "ncode.zncl401.view.Popup"
                });
            }

            // 2. 비동기 로드가 완료되면 팝업 창을 활성화합니다.
            this._pDialog2.then(function (oPopup) {
                oPopup.open();
            });
        },

        /** 
         
팝업 내부 Close 버튼 클릭 시 호출*/
      onClose: function (oEvent) {   
         // 1번 방법. Fragment 내부에서 정의된 Dialog ID를 찾아 모달창을 닫습니다. this.byId("idPopup").close(); //각자 수정
         // 2번 방법 Fragment 내부에서 정의된 Dialog ID를 찾아 모달창을 닫습니다.
         debugger
        let oDialog = oEvent.getSource().getParent();
        if(oDialog){
            oDialog.close();
            };
        
       }

    // onClose2: function () {// Fragment2 내부에서 정의된 Dialog ID를 찾아 모달창을 닫습니다.
    //       this.byId("idPopup").close();}

        }); // <-- Controller.extend 닫기
    }); // <-- sap.ui.define 닫기