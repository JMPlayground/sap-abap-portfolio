sap.ui.define([], function () {
    "use strict";

    return {
        //----------------------------------------------
        //[팀원] 별점 평균 계산 (App.controller에서 시작할 때 사용)
        //----------------------------------------------
        averageRating: function (aReviews) {
            //리뷰가 없을 때의 예외처리
            if (!aReviews || aReviews.length === 0) {
                return 0;
            }
            //array.reduce(callback(accumulator, currentValue), initialValue)
            //배열 0번째부터 마지막까지 순회하며 Rating 합계를 구함
            let fTotal = aReviews.reduce(function (sum, review) { return sum + parseFloat(review.Rating || 0); }, 0);

            //소수 1자리로 반올림 (정렬·표시 값 통일)
            return Math.round((fTotal / aReviews.length) * 10) / 10;
        },

        //----------------------------------------------
        //[정민] 대표리뷰 계산: 별점 가장 높은 리뷰 (동점이면 최근 방문)
        //       App.controller에서 시작할 때 사용
        //----------------------------------------------
        repReview: function (aReviews) { 
            if (!aReviews || aReviews.length === 0) {
                return "";
            }
            let aSorted = aReviews.slice().sort(function (a, b) {
                return (b.Rating - a.Rating) || String(b.VisitDate).localeCompare(String(a.VisitDate));
            });
            return aSorted[0].ReviewText;
        },

        repRating: function (aReviews) {
            if (!aReviews || aReviews.length === 0) {
                return 0;
            }
            let aSorted = aReviews.slice().sort(function (a, b) {
                return (b.Rating - a.Rating) || String(b.VisitDate).localeCompare(String(a.VisitDate));
            });
            return aSorted[0].Rating;
        },

        //----------------------------------------------
        //[정민] 평균 숫자 표시용 (4 → "4.0", 4.3 → "4.3")
        //----------------------------------------------
        avgText: function (fAvg) {
            return (fAvg === undefined || fAvg === null) ? "" : Number(fAvg).toFixed(1);
        },

        //----------------------------------------------
        //[공통] 리뷰 팝업용: 9000 → "9,000원" / "2025-11-25" → "2025.11.25"
        //----------------------------------------------
        price: function (iPrice) {
            return (iPrice === undefined || iPrice === null) ? "" : Number(iPrice).toLocaleString("ko-KR") + "원";
        },

        date: function (sDate) {
            return sDate ? sDate.replace(/-/g, ".") : "";
        },

        //----------------------------------------------
        //[공통] "img/food/gukbap.jpg" → 앱 기준 전체 경로 (http로 시작하면 그대로)
        //----------------------------------------------
        imageUrl: function (sPath) {
            if (!sPath || sPath.startsWith("http")) {
                return sPath;
            }
            return sap.ui.require.toUrl("zcl4mukgorithm/zcl4mukgorithm/" + sPath);
        },
        

        
        

    };
});
