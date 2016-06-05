randmControllers.controller("MonitoringCtrl", function($scope) {
    console.log("MonitoringCtrl");
    $scope.activeButton = 'ALL';

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
    };
});
