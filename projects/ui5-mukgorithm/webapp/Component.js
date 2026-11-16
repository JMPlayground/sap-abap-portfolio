sap.ui.define([
    "sap/ui/core/UIComponent",
    "zcl4mukgorithm/zcl4mukgorithm/model/models",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models, JSONModel) => {
    "use strict";

    return UIComponent.extend("zcl4mukgorithm.zcl4mukgorithm.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // component에서  바인딩 처리 구문

            // 1. 새로운 JSONModel인 oModel 생성
            let oModel = new JSONModel();

            // 2. model 폴더 하위에 있는 products_data.json 데이터 로드
            oModel.loadData(
                sap.ui.require.toUrl("zcl4mukgorithm/zcl4mukgorithm/model/restaurants.json")
            );
            
            // 3. 해당 프로젝트 뷰 전체에 oModel 바인딩
            this.setModel(oModel);

            // 4. 라우터 초기화
            this.getRouter().initialize();
        }
    });
});