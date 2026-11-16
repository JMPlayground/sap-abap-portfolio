sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("ncode.zncl0402ljm.controller.NotFound", {

        // 목록으로 이동 (기록 덮어쓰기 → 뒤로가기로 NotFound 재진입 방지)
        onGoList() {
            this.getOwnerComponent().getRouter().navTo("RouteList", {}, true);
        }
    });
});
