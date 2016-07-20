randmControllers.controller("MonitoringCtrl", function($scope, monitoringService, $ionicLoading, MonitoringTests) {
    console.log("MonitoringCtrl");
    /*    $scope.activeButton = 'ALL';

        $scope.type = "Line";
        $scope.labels = ["8:00 am", "8:15 am", "8:30 am", "8:45 am", "9:00 am", "9:15 am", "9:30 am", "9:45 am"];
        $scope.series = ['SRP P', 'SRP F', 'BBRP P', 'BBRP F'];
        $scope.data = [
            [6, 3, 1, 4, 5, 6, 6, 5],
            [0, 2, 5, 2, 1, 0, 0, 1],
            [5, 4, 3, 5, 4, 5, 5, 4],
            [0, 1, 2, 0, 1, 0, 0, 1]
        ];

        $scope.toggleLine = function() {
            $scope.type = $scope.type === 'Line' ?
                'Bar' : 'Line';
        };

        $scope.togglePie = function() {
            $scope.typeP = $scope.typeP === 'Doughnut' ?
                'Pie' : 'Doughnut';
        };

        $scope.typeP = "Doughnut";

        $scope.labelsP = ["S P", "S F", "B P", "B F"];
        $scope.seriesP = ["SRP Passed", "SRP Failed", "BBRP Passed", "BBRP Failed"];
        $scope.dataP = [300, 300, 200, 400];

        $scope.onBBRP = function() {
            $scope.activeButton = 'BBRP';
            $scope.type = "Line";
            $scope.labels = ["8:00 am", "8:15 am", "8:30 am", "8:45 am", "9:00 am"];
            $scope.series = ['BBRP P', 'BBRP F'];
            $scope.data = [
                [6, 3, 1, 4, 5],
                [0, 2, 5, 2, 1]
            ];

            $scope.labelsP = ["BBRP P", "BBRP F"];
            $scope.seriesP = ["BBRP Passed", "BBRP Failed"];
            $scope.dataP = [200, 400];
        };

        $scope.onSRP = function() {
            $scope.activeButton = 'SRP';
        };

        $scope.onALL = function() {
            $scope.activeButton = 'ALL';

            $scope.labels = ["8:00 am", "8:15 am", "8:30 am", "8:45 am", "9:00 am", "9:15 am", "9:30 am", "9:45 am"];
            $scope.series = ['SRP P', 'SRP F', 'BBRP P', 'BBRP F'];
            $scope.data = [
                [6, 3, 1, 4, 5, 6, 6, 5],
                [0, 2, 5, 2, 1, 0, 0, 1],
                [5, 4, 3, 5, 4, 5, 5, 4],
                [0, 1, 2, 0, 1, 0, 0, 1]
            ];


            $scope.labelsP = ["SRP P", "SRP F", "BBRP P", "BBRP F"];
            $scope.seriesP = ["SRP Passed", "SRP Failed", "BBRP Passed", "BBRP Failed"];
            $scope.dataP = [300, 300, 200, 400];
        };*/

    $ionicLoading.show();

    $scope.doRefresh = function() {
        monitoringService.query().then(function(responseData) {
            console.log("refresh");
            var row;
            $scope.data = responseData.data;
            for (row in $scope.data.rows) {
                //console.log("Row key : " + $scope.data.rows[row].key);
                // Convert scenarios to english names if they exist
                var scenarioName = $scope.data.rows[row].key;
                if (MonitoringTests.hasOwnProperty(scenarioName)) {
                    $scope.data.rows[row].scenarioName = MonitoringTests[scenarioName].name;
                    $scope.data.rows[row].subsystem = MonitoringTests[scenarioName].subsystem;
                } 
                else {
                    $scope.data.rows[row].scenarioName = scenarioName;
                }
                //console.log("Row new name : " + $scope.data.rows[row].scenarioName);
                //console.log("Row subsystem: " +$scope.data.rows[row].subsystem);
                if ($scope.data.rows[row].value.responseTime === '0') {
                    $scope.data.rows[row].value.responseTime = "-";
                }
                $scope.data.rows[row].value.transactionStartTime = new Date($scope.data.rows[row].value.transactionStartTime);
            }

        }).catch(function(err) {
            console.error('ERR', JSON.stringify(err));

        }).finally(function() {
            console.log("finally");
            $ionicLoading.hide();
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.doRefresh();
    console.log($scope.data);

    $scope.onTapSenario = function(item) {
        console.log("onTapSenario");
    };


});


randmControllers.controller('MonitoringDetailsScrollCtr', function($scope, monitoringDetailDataService, $stateParams) {

    console.log('MonitoringDetailsScrollCtr')
    var scenarioName = "R1_1_FTER_SRP_Valid";
    if ($stateParams.scenarioName != undefined) {
        scenarioName = $stateParams.scenarioName;
    }

    $scope.title = scenarioName;

    $scope.noMoreItemsAvailable = false;

    $scope.detailsview = {};

    $scope.startTime = new Date();
    $scope.detailsview.searchDate = $scope.startTime;
    $scope.detailsview.searchDateOK = true;
    console.log('startTime before ' + $scope.startTime)
    $scope.startTime.setHours($scope.startTime.getHours() - 3);
    console.log('startTime after ' + $scope.startTime)
    $scope.items = [];

    $scope.dateChange = function() {

        console.log("on Date change " + $scope.detailsview.searchDate);
        if ($scope.detailsview.searchDate != undefined && $scope.detailsview.searchDate < new Date()) {
            $scope.detailsview.searchDateOK = true;
            $scope.items = [];
            $scope.startTime = $scope.detailsview.searchDate;
            $scope.startTime.setHours(21);
            $scope.loadMore();
        } else {
            $scope.detailsview.searchDateOK = false;
        }


    }

    $scope.loadMore = function() {

        console.log('loadMore' + $scope.detailsview.searchDate);

        if ($scope.items.length >= 50) {
            $scope.noMoreItemsAvailable = true;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        } else {
            monitoringDetailDataService.queryInterval(scenarioName, $scope.startTime, 3).then(function(responseData) {
                    console.log("monitoringDetailDataService" + responseData.data.rows.length);
                    if (responseData.data.rows.length > 0) {
                        responseData.data.rows.sort(function(a, b) {
                            //console.log("berfore" + new Date(a.doc.transactionStartTime).toLocaleString());
                            //console.log("after" + new Date(a.doc.transactionStartTime));
                            a.doc.transactionStartTime = new Date(a.doc.transactionStartTime).getTime();
                            b.doc.transactionStartTime = new Date(b.doc.transactionStartTime).getTime();
                            //console.log("after" + new Date(a.doc.transactionStartTime).toLocaleString());
                            return (a.doc.transactionStartTime - b.doc.transactionStartTime);
                        });
                        responseData.data.rows = responseData.data.rows.reverse();
                        console.log('responseData.data.rows', JSON.stringify(responseData.data.rows));
                    }

                    $scope.items = ($scope.items).concat(responseData.data.rows);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    console.log("item lentgth : " + $scope.items.length);
                    $scope.startTime.setHours($scope.startTime.getHours() - 3);
                })
                .finally(function() {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });

        }
    };


    //$scope.loadMore();

})
