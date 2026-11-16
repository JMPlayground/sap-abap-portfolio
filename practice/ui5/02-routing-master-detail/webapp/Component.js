sap.ui.define([
    "sap/ui/core/UIComponent",
    "ncode/zncl040203/model/models",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models, JSONModel) => {
    "use strict";

    return UIComponent.extend("ncode.zncl040203.Component", {
        metadata: {
            manifest   : "json",
            interfaces : [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // [C1] 부모(UIComponent)의 init 먼저 실행 (필수, 지우지 말 것)
            UIComponent.prototype.init.apply(this, arguments);

            // [C2] device 모델 (generator 기본 코드)
            this.setModel(models.createDeviceModel(), "device");

            // [C3] JSON 파일 → 컴포넌트 모델(이름 없는 기본 모델)로 등록
            //      → 모든 View 에서 {/customers} 처럼 바로 바인딩 가능
            //      ★ 경로는 "." 아니라 "ncode/프로젝트명/..." 처럼 슬래시 구분
            let oModel = new JSONModel();
            oModel.loadData(
                sap.ui.require.toUrl("ncode/zncl040203/model/data.json")
            );
            this.setModel(oModel);

            // [C4] 라우터 시작 (manifest.json 의 routing 설정 읽음)
            this.getRouter().initialize();
        }
    });
});