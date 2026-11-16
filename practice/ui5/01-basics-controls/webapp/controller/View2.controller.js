sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"

], function (Controller, MessageBox, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict"; //strict 모드를 사용하겠다는 의미 (잘못된 구문 알려주기 )

    return Controller.extend("ncode.zncl401.controller.View2", {
        onInit() {


            //     let oData = {
            //     std      : "3",
            //     aStdInfo : [

            //         { stdNo: "1", sName: "김예지", class: "4", classT: "2조" },
            //         { stdNo: "2", sName: "김지은", class: "4", classT: "2조" },
            //         { stdNo: "3", sName: "이정민", class: "4", classT: "2조" },
            //         { stdNo: "4", sName: "이준헌", class: "4", classT: "2조" },
            //         { stdNo: "5", sName: "함재연", class: "4", classT: "2조" },

            //     ]      
            // };

            //             let oModel = new JSONModel(oData);

            //     this.getView().setModel(oModel); //aggregation Binding

            // let oModel = new JSONModel();
            // oModel.loadData(
            //     sap.ui.require.toUrl("ncode/zncl401/model/code3.json")
            // );
            // this.getView().setModel(oModel);

        let oTable = this.byId("idResultTable");

        //  글로벌 데이터 도착해서 세팅 다 끝나면 그때 알려줘!"
    oTable.attachEventOnce("updateFinished", function () {
        
        let oBinding = oTable.getBinding("items"); // 이제 바인딩이 확실하게 존재함!

        if (oBinding) {
            let aFilters = [new Filter("stdNo", FilterOperator.EQ, "")];
            oBinding.filter(aFilters);
        }
        
    });

        },

        onClassChange: function () {

            // // Case 1 배열로 처리하는 방법
            // let oModel      = this.getView().getModel();
            // // 선택한 조 값 획득
            // let sClassT     = this.byId("classCombo").getSelectedKey();
            // // 모델의 student 경로에서 전체 데이터 취득
            // let aStudents   = oModel.getProperty("/student");
            // // 선택한 조원의 값만 넣어 줄 신규 배열
            // let aResult     = [];

            // // 전체 학생을 돌며 조에 일치하는 학생만 찾기
            // for (let i = 0; i < aStudents.length; i++) {
            //     if(aStudents[i].classT === sClassT ){ 
            //         aResult.push(aStudents[i]);

            //     }

            // }
            // //추가한 학생배열을 모델의 새로운 경로에  새로저장
            // oModel.setProperty("/filteredStudents",aResult);

            // // 조가 변경되므로 기존 선택된 대상 초기
            // this.byId("studentCombo").setSelectedKey("");

            // Case 2 filter() 사용 모델에서 전체 학생 츼득
            let oModel = this.getView().getModel();
            let sClassT = this.byId("classCombo").getSelectedKey();
            let aStudents = oModel.getProperty("/student") || [];

            //filter() 함수 사용 조건에 맞는 항목만

            let aResult = aStudents.filter(function (student) {
                return student.classT === sClassT;
            }
            );

            oModel.setProperty("/filteredStudents", aResult); //JSON에 이 이름이 없더라도(어느이름이더라도) view랑만 일치하면 된다.

            this.byId("studentCombo").setSelectedKey("");


        },

        onSearch: function () {

            let oModel = this.getView().getModel();

            //사용자가 선택한 조와 학생 값 읽어오기 

            let sClassKey = this.byId("classCombo").getSelectedKey();
            // let sStudentKey     = this.byId("studentCombo").getSelectedKey();
            let sStudentName = this.byId("inpNum1").getValue();

            //조롤 선택하지 않은 경우 처리 
            //     if (!sClassKey) { 
            //         sap.m.MessageToast.show("조를 먼저 선택해 주세요.");
            //         return;

            //     }

            //     let aStudents       = oModel.getProperty("/student") || [];
            //     let aTableResult    = [];

            //     //신규배열에 필터링된 값들을 담고 그 배열을 모델에 속성으로 넣고 바인딩
            //     // Case 1: 조만 선택한 경우 >>> 조전체수강생
            //     if (sClassKey && !sStudentKey) {
            //     aTableResult = aStudents.filter(function (student) {
            //         return student.classT === sClassKey;

            //     });
            // }
            //     // Case 2: 조와 학생을 모두 콕 집어 선택한 경우 -> 해당 특정 학생 1명만 조회
            //     else if (sClassKey && sStudentKey) {
            //         aTableResult = aStudents.filter(function (student) {
            //             return student.classT === sClassKey && student.stdNo === sStudentKey;
            //         });
            //     }
            //     // 테이블과 바인딩된 searchResult 경로에 결과 데이터 반영
            //     oModel.setProperty("/searchResult", aTableResult);
            //     // 조회된 건 수 Toast 알림
            //     sap.m.MessageToast.show(aTableResult.length + "건이 조회되었습니다.");

            // 기존 모델에 필터링 적용, 처음 로딩시 전체 조회될 수밖에 없음
            // let oTable       = this.byId("idResultTable");
            // let oBinding     = oTable.getBinding("items");
            // let aFilters     = [];

            // aFilters = [];

            // aFilters.push( new Filter("classT", FilterOperator.EQ, sClassKey ));
            // if(sStudentKey){
            //     aFilters.push(new Filter("stdNo", FilterOperator.EQ,sStudentKey))
            // }

            // oBinding.filter(aFilters);

            // let iCount = oBinding.getLength();

            // MessageToast.show(iCount + "건이 조회되었습니다.");

            let oTable = this.byId("idResultTable");
            let oBinding = oTable.getBinding("items");
            let aFilters = [];

            aFilters = [];

            aFilters.push(new Filter("classT", FilterOperator.EQ, sClassKey));
            aFilters.push(new Filter("stdName", FilterOperator.StartsWith, sStudentName));

            // if(sStudentKey){
            //     aFilters.push(new Filter("stdNo", FilterOperator.EQ,sStudentKey))
            // }

            oBinding.filter(aFilters);

            let iCount = oBinding.getLength();

            MessageToast.show(iCount + "건이 조회되었습니다.");


            let oContext = ""
            this.byId("idScoreTable").setBindingContext(oContext);

        },

        onRowSelect: function (oEvent) {
            // 선택된 Row의 정보를 읽는다
            let oRow = oEvent.getParameter("listItem");

            // 선택된 ROw의 정보로 모델의 정보를 취득한다. + 예외처리(취소했을때)
            if (!oRow) {
                return;
            }
            // Student(index) 의 정보를 읽어온다.
            let oContext = oRow.getBindingContext();
            this.byId("idScoreTable").setBindingContext(oContext);

            //읽어온 정보를 가지고 score table에 적용한다.


        },

        onScoreRowSelect: function (oEvent) {

            let oRow = oEvent.getParameter("listItem");
            if (!oRow) {
                return;
            }
            // 선택된 과목 데이터 Context 취득
            // 예: "/student/0/_score/1" (첫번째 학생의 두번째 과목)
            let oScoreContext   = oRow.getBindingContext();
            let oRouter         = this.getOwnerComponent().getRouter();
            let aPath           = oScoreContext.getPath().split("/");

            // 라우터 호출 시  index 전달
            let sStudentIndex   = aPath[2];
            let sScoreIndex     = aPath[4];

            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                studentIndex: sStudentIndex,
                scoreIndex: sScoreIndex
            });

            // 화면 이동 후 선택 상태가 남아있지 않도록 선택 해제 처리
            oEvent.getSource().removeSelections(true);
        }
    });





        // onSearch: function(){

        //     // let aStdInfo = [

        //     //     { stdNo: "1", sName: "김예지", class: "4", classT: "2조" },
        //     //     { stdNo: "2", sName: "김지은", class: "4", classT: "2조" },
        //     //     { stdNo: "3", sName: "이정민", class: "4", classT: "2조" },
        //     //     { stdNo: "4", sName: "이준헌", class: "4", classT: "2조" },
        //     //     { stdNo: "5", sName: "함재연", class: "4", classT: "2조" },

        //     // ];

        //    let aCarrInfo = [
        //             {
        //                 "CARRID": "AA",
        //                 "CARRNAME": "American Airlines",
        //                 "CURRCODE": "USD",
        //                 "URL": "http://aa.com/"
        //             },
        //             {
        //                 "CARRID": "DL",
        //                 "CARRNAME": "Delta Air Lines",
        //                 "CURRCODE": "USD",
        //                 "URL": "http://delta.com/"
        //             },
        //             {
        //                 "CARRID": "LH",
        //                 "CARRNAME": "Lufthansa",
        //                 "CURRCODE": "EUR",
        //                 "URL": "http://lufthansa.com/"
        //             },
        //             {
        //                 "CARRID": "JL",
        //                 "CARRNAME": "Japan Airlines",
        //                 "CURRCODE": "JPY",
        //                 "URL": "http://jal.co.jp/"
        //             },
        //             {
        //                 "CARRID": "KE",
        //                 "CARRNAME": "Korean Air",
        //                 "CURRCODE": "KRW",
        //                 "URL": "http://koreanair.com/"
        //             },
        //             {
        //                 "CARRID": "SQ",
        //                 "CARRNAME": "Singapore Airlines",
        //                 "CURRCODE": "SGD",
        //                 "URL": "http://singaporeair.com/"
        //             },
        //             {
        //                 "CARRID": "AF",
        //                 "CARRNAME": "Air France",
        //                 "CURRCODE": "EUR",
        //                 "URL": "http://airfrance.com/"
        //             },
        //             {
        //                 "CARRID": "BA",
        //                 "CARRNAME": "British Airways",
        //                 "CURRCODE": "GBP",
        //                 "URL": "http://britishairways.com/"
        //             }

        //     ];

        //     let oView = this.getView(); 
        //     let oText1 = oView.byId("inpNum1").getValue();
        //     let oText2 = oView.byId("inpNum2").getValue();
        //     let oText3 = oView.byId("inpNum3")
        //     let oText4 = oView.byId("inpNum4")
        //     let oText5 = oView.byId("inpNum5")
        //     let oText6 = oView.byId("inpNum6")

        //     let index
        //     let bFlag = false 

        //     for(index=0; index < aCarrInfo.length; index++){
        //     if((aCarrInfo[index].CARRNAME == oText2) || aCarrInfo[index].CARRID == oText1) {
        //         oText3.setValue(aCarrInfo[index].CARRID),
        //         oText4.setValue(aCarrInfo[index].CARRNAME),
        //         oText5.setValue(aCarrInfo[index].CURRCODE),
        //         oText6.setValue(aCarrInfo[index].URL);
        //         // oText5.setValue(aCarrInfo[index].classT);        
        //     bFlag = true;
        //     break;
        //     }
        //     }
        //     if(bFlag == false){
        //     MessageBox.information("존재하는 항공사가 아닙니다.");

        //     }
        //     } 


    });
    
