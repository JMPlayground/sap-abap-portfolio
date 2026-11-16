sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "zcl4mukgorithm/zcl4mukgorithm/model/formatter"
], function (Controller, formatter) {
    "use strict";

    return Controller.extend("zcl4mukgorithm.zcl4mukgorithm.controller.App", {

        //----------------------------------------------------------------
        // [공통] 앱 시작 시 80곳의 AvgRating · RepReview 계산해서 모델에 넣기
        //        → Main 정렬(Sorter), 피드, 랜덤 결과 카드가 이 값을 같이 씀
        //----------------------------------------------------------------
        onInit: function () {
            const oModel = this.getOwnerComponent().getModel();

            // JSON은 비동기로 읽히니까, 다 읽힌 뒤에 계산
            oModel.dataLoaded().then(function () {
                const aStores = oModel.getProperty("/Restaurants") || [];

                aStores.forEach(function (oStore, i) {
                    const sPath = "/Restaurants/" + i;
                    oModel.setProperty(sPath + "/AvgRating", formatter.averageRating(oStore.Reviews));
                    oModel.setProperty(sPath + "/RepReview", formatter.repReview(oStore.Reviews));
                    oModel.setProperty(sPath + "/RepRating", formatter.repRating(oStore.Reviews));
                    
                });
            });
        }
    });
});
