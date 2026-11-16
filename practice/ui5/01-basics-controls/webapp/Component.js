sap.ui.define([
    "sap/ui/core/UIComponent",
    "ncode/zncl401/model/models",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models,JSONModel) => {
    "use strict";

    return UIComponent.extend("ncode.zncl401.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            let oModel = new JSONModel();
            oModel.loadData(
                sap.ui.require.toUrl("ncode/zncl401/model/code3.json")
            );
            // 컴포넌트 모델로 설정
            this.setModel(oModel);

            // enable routing
            this.getRouter().initialize();
        }
    });
});