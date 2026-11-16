sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("ncode.zncl040203.controller.Basic", {

        // ==================================================================
        // [B0] onInit : 이 화면 전용 JSON 모델 세팅
        //      ★ View 에 setModel 하면 컴포넌트 모델보다 우선 (이 View 에서는 {/customers} 안 보임)
        // ==================================================================
        onInit: function () {
            let oData = {
                operList    : [
                    { key : "+", text : "+" },
                    { key : "-", text : "-" },
                    { key : "*", text : "*" },
                    { key : "/", text : "/" },
                    { key : "%", text : "%" }
                ],
                genderList  : [
                    { key : "M", text : "남성" },
                    { key : "F", text : "여성" }
                ],
                careerList  : [
                    { text : "ABAP 개발자" },
                    { text : "Fiori/UI5 개발자" },
                    { text : "아직 미정" }
                ]
            };

            let oModel  = new JSONModel(oData);
            this.getView().setModel(oModel);
        },

        // 뒤로가기 (간단 버전 : 목록으로)
        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
        },

        // ==================================================================
        // [B1] 계산기 : getValue → Number 변환 → 예외처리 → setText
        // ==================================================================
        onCalc: function () {
            let oView       = this.getView();
            let sNum1       = oView.byId("inpNum1").getValue();          // Input = getValue (항상 문자열)
            let sNum2       = oView.byId("inpNum2").getValue();
            let sOper       = oView.byId("selOper").getSelectedKey();    // Select = getSelectedKey
            let oResult     = oView.byId("txtCalcResult");               // Text = setText

            // [예외 1] 빈 값 (Number("") 는 0 이 되므로 변환 전에 검사!)
            if (sNum1 === "" || sNum2 === "") {
                MessageBox.warning("숫자를 모두 입력해 주세요.");
                return;
            }

            let iNum1       = Number(sNum1);
            let iNum2       = Number(sNum2);

            // [예외 2] 숫자가 아님
            if (isNaN(iNum1) || isNaN(iNum2)) {
                MessageBox.error("숫자만 입력할 수 있습니다.");
                return;
            }

            // [예외 3] 0 으로 나누기
            if ((sOper === "/" || sOper === "%") && iNum2 === 0) {
                MessageBox.error("0 으로 나눌 수 없습니다.");
                return;
            }

            let iResult     = 0;

            switch (sOper) {
                case "+": iResult = iNum1 + iNum2; break;
                case "-": iResult = iNum1 - iNum2; break;
                case "*": iResult = iNum1 * iNum2; break;
                case "/": iResult = iNum1 / iNum2; break;
                case "%": iResult = iNum1 % iNum2; break;
            }

            oResult.setText(String(iResult));
        },

        // ==================================================================
        // [B2] 반복문 : 문자열을 += 로 모은 뒤 마지막에 setValue 1번
        //      (반복문 안에서 setValue 하면 마지막 줄만 남음!)
        // ==================================================================
        onGugudan: function () {
            let sNum        = this.byId("inpLoop").getValue();
            let iDan        = Number(sNum);
            let sResult     = "";

            // [예외] 빈 값 / 범위
            if (sNum === "" || isNaN(iDan) || iDan < 1 || iDan > 9) {
                MessageBox.warning("1~9 사이 숫자를 입력해 주세요.");
                return;
            }

            for (let i = 1; i <= 9; i++) {
                sResult += iDan + " X " + i + " = " + (iDan * i) + "\n";
            }

            this.byId("taLoop").setValue(sResult);
        },

        onStar: function () {
            let sNum        = this.byId("inpLoop").getValue();
            let iRow        = Number(sNum);
            let sResult     = "";

            if (sNum === "" || isNaN(iRow) || iRow < 1 || iRow > 20) {
                MessageBox.warning("1~20 사이 숫자를 입력해 주세요.");
                return;
            }

            // 이중 for : 바깥 = 줄, 안쪽 = 별 개수
            for (let i = 1; i <= iRow; i++) {
                let sLine = "";
                for (let j = 1; j <= i; j++) {
                    sLine += "*";
                }
                sResult += sLine + "\n";
            }

            this.byId("taLoop").setValue(sResult);
        },

        // ==================================================================
        // [B3] 배열 for 검색 : bFound 깃발 + break + 반복문 "밖"에서 없음 처리
        // ==================================================================
        onMemberSearch: function () {
            let aStdInfo = [
                { stdNo : "26010601", sName : "김예지", classT : "2조" },
                { stdNo : "26010602", sName : "이정민", classT : "2조" },
                { stdNo : "26010603", sName : "이준헌", classT : "2조" },
                { stdNo : "26010604", sName : "함재연", classT : "2조" }
            ];

            let oView       = this.getView();
            let sKey        = oView.byId("inpKey").getValue().trim();
            let bFound      = false;

            // [예외] 빈 값
            if (!sKey) {
                MessageToast.show("학번 또는 이름을 입력해 주세요.");
                return;
            }

            for (let i = 0; i < aStdInfo.length; i++) {
                // 학번 "또는" 이름 일치 → ||  (둘 다 = &&)
                if (aStdInfo[i].stdNo === sKey || aStdInfo[i].sName === sKey) {
                    oView.byId("outStdNo").setValue(aStdInfo[i].stdNo);     // Input = setValue
                    oView.byId("outName").setValue(aStdInfo[i].sName);
                    oView.byId("outClass").setValue(aStdInfo[i].classT);
                    bFound = true;
                    break;      // 찾았으면 반복 종료
                }
            }

            // ★ else 를 for 안에 넣으면 첫 번째 사람만 비교하고 끝남 → 반드시 for 밖에서
            if (!bFound) {
                oView.byId("outStdNo").setValue("");
                oView.byId("outName").setValue("");
                oView.byId("outClass").setValue("");
                MessageBox.error("우리조 구성원이 아닙니다.");
            }
        },

        // ==================================================================
        // [B4] 등록 : 컨트롤별 값 읽기 공식
        //      Input            → getValue()
        //      Select/ComboBox  → getSelectedKey()  /  getSelectedItem().getText()
        //      RadioButtonGroup → getSelectedButton().getText()  /  getSelectedIndex()
        // ==================================================================
        onRegister: function () {
            let oView       = this.getView();
            let oName       = oView.byId("inpRegName");
            let sName       = oName.getValue().trim();
            let sGender     = oView.byId("selGender").getSelectedItem().getText();
            let sAddress    = oView.byId("inpAddress").getValue();
            let sCareer     = oView.byId("rbgCareer").getSelectedButton().getText();

            // [예외] 필수값 : 빨간 테두리 + 메시지
            if (!sName) {
                oName.setValueState("Error");
                oName.setValueStateText("이름은 필수 입력입니다.");
                MessageBox.warning("이름을 입력해 주세요.");
                return;
            }
            oName.setValueState("None");

            let sResult     = "이름: "      + sName    + "\n"
                            + "성별: "      + sGender  + "\n"
                            + "주소: "      + sAddress + "\n"     // 미입력 시 빈 값 그대로
                            + "희망 진로: " + sCareer;

            oView.byId("taRegResult").setValue(sResult);
            MessageToast.show(sName + " 님이 등록되었습니다.");
        },

        // 초기화 : setValue("") / setSelectedKey(기본값) / setSelectedIndex(0)
        onRegReset: function () {
            let oView = this.getView();

            oView.byId("inpRegName").setValue("");
            oView.byId("inpRegName").setValueState("None");
            oView.byId("selGender").setSelectedKey("M");
            oView.byId("inpAddress").setValue("");
            oView.byId("rbgCareer").setSelectedIndex(0);
            oView.byId("taRegResult").setValue("");
        }
    });
});