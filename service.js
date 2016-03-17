//Admin
function appServices($http, $q, $rootScope) {
    return ({
        doLogin: doLogin,
        doAction: doAction,
        doSearch: doSearch,
        routeChange: routeChange,
        getUserByToken: getUserByToken,
        chPW: chPW,
        getTable: getTable,
    });
    function doLogin(lInfo) {
        NProgress.start(); $rootScope.isBusy += 1;
        var request = $http({ method: "post", url: "api/user/dologin", data: lInfo });
        return (request.then(handleSuccess, handleError));
    }
    function doAction(actionParam, path) {
        NProgress.start(); $rootScope.isBusy += 1;
        var request = $http({ method: "post", url: "api/" + path, data: actionParam });
        return (request.then(handleSuccess, handleError));
    }
    function doSearch(aSearch) {
        NProgress.start(); $rootScope.isBusy += 1;
        var request = $http({ method: "get", url: "api/search/global?Token=" + aSearch.Token + "&Search=" + aSearch.Value });
        return (request.then(handleSuccess, handleError));
    }
    function routeChange(actionParam) {
        $http({ method: "post", url: "api/user/routechange", data: actionParam });
    }
    function getTable(aTabInfo) {
        NProgress.start(); $rootScope.isBusy += 1;
        var request = $http({ method: "post", url: "api/" + aTabInfo.api, data: aTabInfo });
        return (request.then(handleSuccess, handleError));
    }
    function getUserByToken(userToken) {
        $rootScope.isBusy += 1;
        var request = $http({ method: "post", url: "api/user/fromtoken", data: { "Token": userToken } });
        return (request.then(handleSuccess, handleError));
    }
    function chPW(userToken, oldPW, newPW) {
        NProgress.start(); $rootScope.isBusy += 1;
        var request = $http({ method: "post", url: "api/user/changepw", data: { "Token": userToken, "Value": oldPW, "Data": newPW } });
        return (request.then(handleSuccess, handleError));
    }
    function handleError(response) {
        NProgress.done(); if ($rootScope.isBusy > 0) $rootScope.isBusy -= 1;
        if (response.data.ExceptionMessage) response.data.Info = "Server Error: " + response.data.ExceptionMessage; else response.data.Info = response.data.message;
        response.data.Code = -1;
        $q.reject(response.data.message);
        return response.data;
    }
    function handleSuccess(response) {
        NProgress.done(); if($rootScope.isBusy > 0) $rootScope.isBusy -= 1;
        return response.data;
    }
}
function modalService($uibModal) {
    var modalDefaults = { backdrop: true, keyboard: true, modalFade: true, templateUrl: '/views/modal.html' };
    var modalOptions = { closeButtonText: 'Cancel', actionButtonText: 'OK', headerText: 'Proceed?', bodyText: 'Perform this action?' };
    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };
    this.show = function (customModalDefaults, customModalOptions) {
        var tempModalDefaults = {};
        var tempModalOptions = {};
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
        angular.extend(tempModalOptions, modalOptions, customModalOptions);
        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $uibModalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function (result) { $uibModalInstance.close(result); };
                $scope.modalOptions.close = function (result) { $uibModalInstance.dismiss('cancel'); };
            }
        }
        return $uibModal.open(tempModalDefaults).result;
    };
}
