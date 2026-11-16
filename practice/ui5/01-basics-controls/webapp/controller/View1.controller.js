sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"

], function (Controller, MessageBox, JSONModel) {
    "use strict"; //strict 모드를 사용하겠다는 의미 (잘못된 구문 알려주기 )
    let oSwitch = true;
    
    return Controller.extend("ncode.zncl401.controller.View1", {
        onInit() { 
            let oView = this.getView();    
            let oHbox = oView.byId("hbox0");
            let oText = oHbox.addItem(new sap.m.Text({ text: "추가된 항목" } ));

            let oData = {            
                oprlist: [
                    {key: "item1", text: "+"},
                    {key: "item2", text: "-"},
                    {key: "item3", text: "*"},
                    {key: "item4", text: "/"},
                    {key: "item5", text: "%"},
                ]

            };
            //JSON모델 생성 및 데이터 세팅
            let oModel = new JSONModel(oData);

            this.getView().setModel(oModel); //aggregation Binding
        },

        onSearch: function(){
            let oView = this.getView(); // view object를 취득한다.
            
            let oText = oView.byId("text3"); // view object에서 text3이라는 ID를 가진 object를 취득한다.
            oText.setText("집에 갈 시간입니다.");

             let iNum1 = Number(oView.byId("inpNum1").getValue());
             let iOper = oView.byId("inpOper").getValue();
             let iNum2 = Number(oView.byId("inpNum2").getValue());

             if((iOper == "")||(iNum1 == "")||(iNum2 == ""))
                {oText.setText("입력값을 입력하세요")
              
            
             }
            else if(iOper == "+"){
                MessageBox.information(String(iNum1 + iNum2));
                // {oText.setText(Number(iNum1)+Number(iNum2))
        }
            else if(iOper == "-"){
                
                oText.setText(Number(iNum1)-Number(iNum2))
        }
             else if(iOper == "*"){
                
                oText.setText(Number(iNum1)*Number(iNum2))
        }
             else{
                
                oText.setText(Number(iNum1 )/Number(iNum2))
        };

        let iNum3 = oView.byId("inpNum3").getValue();
        let oArea = oView.byId("result");
        let index
        let sResult = "";
    
        for(index = 0; index < 9; index++){
            sResult += iNum3 + "X" + index + "=" + (index * Number(iNum3)+"\n");

        };
    oArea.setValue(sResult);

    },
        onModify: function(){
            let oView = this.getView(); //var 를 안쓰는 이유는 오염 될 수 있기 때문에
            let oText = oView.byId("text3");
            oText.setText("출근 할 시간입니다.");
            if(oSwitch == true){
                oSwitch = false, this.getView().byId("button0").setVisible(false)
            }
            else {oSwitch = true, this.getView().byId("button0").setVisible(true)};


        },

        onCreate: function(){
            debugger;
            let oView = this.getView();
            let sNum = Number(oView.byId("inpNum4").getValue());
            let oArea = oView.byId("result2")
            let index1 
            let index2
            let sResult1 = ""
            let sResult2 = ""

            for(index1 = 0; index1 < sNum; index1++ ){
                    sResult1 = "";
                for(index2 = 0; index2 <= index1; index2++ ){
                    sResult1 += '*';

                }
            sResult2 += sResult1 + "\n";

            };
            oArea.setValue(sResult2);
           
        }

    });
});