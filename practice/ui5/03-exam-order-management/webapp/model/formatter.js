sap.ui.define([], function () {
    "use strict";

    // 생산 상태 코드 → 표시 텍스트 · 색상 (한 곳에서 관리)
    const STATUS = {
        "01": { text: "계획",    state: "None" },
        "02": { text: "진행 중", state: "Information" },
        "03": { text: "완료",    state: "Success" },
        "09": { text: "보류",    state: "Error" }
    };

    return {

        // "02" → "진행 중"
        statusText: function (sStatus) {
            return STATUS[sStatus] ? STATUS[sStatus].text : sStatus;
        },

        // "02" → "Information"
        statusState: function (sStatus) {
            return STATUS[sStatus] ? STATUS[sStatus].state : "None";
        },

        // 숫자 콤마 : 1451 → "1,451" (단위는 ObjectNumber unit 이 표시)
        number: function (vNum) {
            if (vNum === null || vNum === undefined || vNum === "" || isNaN(Number(vNum))) {
                return "";
            }
            return Number(vNum).toLocaleString();
        },

        // 가용재고 ≥ 필요수량 → 초록 / 부족 → 빨강
        stockState: function (vStock, vRequired) {
            return Number(vStock) >= Number(vRequired) ? "Success" : "Error";
        },

        // 생산 일정 : 납기일 - 시작일 → "6일 소요"
        period: function (sStart, sDue) {
            if (!sStart || !sDue) {
                return "";
            }
            const iDays = Math.round((new Date(sDue) - new Date(sStart)) / (1000 * 60 * 60 * 24));
            return iDays + "일 소요";
        }
    };
});
