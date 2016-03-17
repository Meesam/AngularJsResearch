var app = angular.module('TRapp', ['ngRoute', 'ngCookies', 'yaru22.angular-timeago', 'ngFileUpload', 'cgNotify',
    'ngSanitize', 'ngAnimate', 'angucomplete-alt', 'ui.bootstrap', 'angular-sortable-view']);

function getRoute(name) {
    return {
        templateUrl: 'views/' + name + '.html?r=' + FTVer,
        controller: name.substring(name.indexOf('/') + 1) + 'Ctrl',
        resolve: {
            load: function ($q, $route, $rootScope) {
                var deferred = $q.defer();
                $script(['views/' + name + '.js?r=' + FTVer], function () { $rootScope.$apply(function () { deferred.resolve(); }); });
                return deferred.promise;
            }
        }
    }
}
app.config(function ($routeProvider, $controllerProvider, $locationProvider) {
    app.registerCtrl = $controllerProvider.register;
    $routeProvider
        // Fleet Operations routings
        .when('/trailers', getRoute('fleetoperation/trailers'))
        .when('/vehicles', getRoute('fleetoperation/vehicles'))
        .when('/vehicle/:ID', getRoute('fleetoperation/vehicledetails'))
        .when('/assets', getRoute('fleetoperation/assets'))
        .when('/fuelmanagement', getRoute('fleetoperation/fuelmanagement'))
        .when('/gpstracking', getRoute('fleetoperation/gpstracking'))
        .when('/insurance', getRoute('fleetoperation/insurance'))
        .when('/trips', getRoute('fleetoperation/operations'))
        .when('/trucklog', getRoute('fleetoperation/trucklog'))
        .when('/tyremanagement', getRoute('fleetoperation/tyremanagement'))

        // Finance routings
        .when('/invoices', getRoute('finance/invoices'))
        .when('/tripcosting', getRoute('finance/tripcosting'))

        // Hr routing
        .when('/user/:ID', getRoute('hr/usersdetails'))
        .when('/users', getRoute('hr/users'))
        .when('/staffs', getRoute('hr/staffs'))
        .when('/staff/:ID', getRoute('hr/staffdetails'))
        .when('/appraisals', getRoute('hr/appraisals'))
        .when('/attendance', getRoute('hr/attendance'))
        .when('/leavemanagement', getRoute('hr/leavemanagement'))
        .when('/traininglog', getRoute('hr/traininglog'))

        // Work shop management routing
        .when('/stockitem', getRoute('workshopmgt/stockitem'))
        .when('/stockitems/:ID', getRoute('workshopmgt/stockitemdetail'))
        .when('/purchaseitems', getRoute('workshopmgt/purchaseitems'))
        .when('/purchaseitem/:ID', getRoute('workshopmgt/purchaseitemdetails'))
        .when('/maintenance', getRoute('workshopmgt/maintenancejobs'))

        // HSSE routing
        .when('/claimmanagement', getRoute('hsse/claimmanagement'))
        .when('/drillsrecord', getRoute('hsse/drillsrecords'))
        .when('/incidentmanagement', getRoute('hsse/incidentmanagement'))
        .when('/proanddoc', getRoute('hsse/procanddocs'))
        .when('/safetystatistics', getRoute('hsse/safetystatistics'))

        // System Master
        .when('/assettypes', getRoute('systemmaster/assettypes'))
        .when('/groups', getRoute('systemmaster/groups'))
        .when('/offices', getRoute('systemmaster/offices'))
        .when('/categories', getRoute('systemmaster/categories'))
        .when('/cpmains', getRoute('systemmaster/cpmains'))
        .when('/logtype', getRoute('systemmaster/logtype'))
        .when('/entity/:ID', getRoute('systemmaster/entitiesdetails'))
        .when('/vehicletypes', getRoute('systemmaster/vehicletypes'))
        .when('/manfs', getRoute('systemmaster/manfs'))
        .when('/models', getRoute('systemmaster/models'))
        .when('/checkpoints', getRoute('systemmaster/checkpoints'))
        .when('/tripdefinition', getRoute('systemmaster/tripdefinition'))
        .when('/cities', getRoute('systemmaster/cities'))
        .when('/entities', getRoute('systemmaster/entities'))
        .when('/trailertypes', getRoute('systemmaster/trailertypes'))
        .when('/chargetype', getRoute('systemmaster/chargetype'))
        .when('/currencies', getRoute('systemmaster/currencies'))
        .when('/departments', getRoute('systemmaster/department'))
        .when('/documenttype', getRoute('systemmaster/documenttype'))
        .when('/forms', getRoute('systemmaster/forms'))
        .when('/gpsvendors', getRoute('systemmaster/gpsvendors'))
        .when('/incidenttype', getRoute('systemmaster/incidenttype'))
        .when('/safetystatisticstype', getRoute('systemmaster/safetytypes'))

        .when('/dashboard', getRoute('dashboard'))
        .when('/search/:Query', getRoute('search'))
        .when('/signin', getRoute('signin'))
        .when('/settings', getRoute('settings'))
        .when('/notfound', { templateUrl: '/views/err/notfound.html' })
        .when('/underdevelopment', { templateUrl: '/views/err/underdevelopment.html' })
        .when('/', getRoute('dashboard'))
        .otherwise({ redirectTo: '/notfound' });
    $locationProvider.html5Mode(true);
});
app.service('appServices', appServices);
app.service('modalService', modalService);
app.controller('mainCtrl', mainCtrl);

app.run(function ($rootScope, $location, $cookies, appServices) {
    var token = $cookies.get('TRUserToken');
    if (token) $rootScope.token = token;
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        $rootScope.ErrPage = null;
        $rootScope.attParam = null;
        $rootScope.comments = [];
        $rootScope.isBusy = 0;
        if (!navigator.onLine) $rootScope.setMsg('Network not connected! Please check internet connection.');
        // Get user if token is there but no user
        if ($rootScope.mUser == null) {
            if ($rootScope.token) {
                appServices.getUserByToken(token).then(function (d) {
                    if (d.Code == 1) {
                        $rootScope.mUser = d.ReturnObj;
                        if ($rootScope.mUser != null && next.templateUrl == "views/signin.html") $location.path("/dashboard");
                        $rootScope.$broadcast('userReady', null);
                        $rootScope.getBUList();
                    } else $rootScope.goSignin(next.templateUrl);
                });
            }
            else $rootScope.goSignin(next.templateUrl);
        }
    });
})

function mainCtrl($scope, $location, $rootScope, $cookies, notify, $http, appServices) {
    $rootScope.mUser = null;
   
    $rootScope.totalComments = 0;
    $rootScope.totalfieldsets = 0;
    $rootScope.attParam = null;
    $rootScope.isBusy = 0;
    $scope.loc = $location;
    $scope.mainMenu = {};
    $scope.toggleSidenav = function (menuId) { $mdSidenav(menuId).toggle(); };
    $scope.addToken = function (str) { return { Search: str, Token: $rootScope.token }; }
    $rootScope.setMsg = function (msg, succ) {
        notify.closeAll();
        notify({ message: msg, classes: (succ ? "alert-success" : "alert-danger"), duration: 5000 });
    }
    $rootScope.goSignin = function (url) {
        if (url && url.indexOf('signin.html') < 0 && url.indexOf('signup.html') < 0 && url.indexOf('passwordreset.html') < 0 && url.indexOf('validate.html') < 0) {
            $rootScope.setMsg('Please sign-in to continue...');
            $location.path("/signin");
        }
    }
    $scope.changeBU = function (buid) {
        appServices.doAction({ Token: $rootScope.token, Obj: buid }, 'user/changebu').then(function (d) {
            if (d.Code == 1) {
                $rootScope.setMsg('Business Unit changed to ' + d.ReturnObj, true);
                $rootScope.mUser.BUName = d.ReturnObj;
                $rootScope.mUser.CurBU = buid;
                $scope.getMenu();
                if ($location.path() != '/dashboard') $location.path('/dashboard'); else $scope.$broadcast('refreshDash');
            } else $rootScope.setMsg(d.Info);
        });
    }
    $scope.doSearch = function () {
        console.log('i am call');
        $scope.globalSearch = $scope.globalSearch.trim();
        if ($scope.globalSearch.length == 0) { $rootScope.setMsg('Please specify a search term!'); return; }
        $location.path("/search/" + encodeURIComponent($scope.globalSearch));
        $scope.globalSearch = '';
    }
    $scope.getMenu = function () {
        appServices.doAction({ Token: $rootScope.token }, 'user/getmenu').then(function (d) {
            if (d.Code == 1) $scope.mainMenu = d.ReturnObj;
        });
    }
   
    $rootScope.logOut = function () {
        $rootScope.mUser = null;
        $rootScope.token = null;
        $cookies.remove('TRUserToken');
        $location.path("/signin");
    }
    $rootScope.goErrPage = function (aErr) {
        $rootScope.ErrPage = aErr;
    }
    $rootScope.getBUList = function () {
        appServices.doAction({ Token: $rootScope.token }, "user/getbulist").then(function (d) {
            if (d.Code == 1) $rootScope.BUList = d.ReturnObj;
        });
        $scope.getMenu();
    }
}

function getTableObj(tableid, token, initSort, apipath, refreshTableFunc) {
    var itf = {};
    itf.id = tableid;
    itf.Rows = {};
    itf.api = apipath;
    itf.SortBy = appStor.gettext(tableid + 'sort', initSort);
    itf.Token = token;
    itf.SortDesc = false;
    itf.RPP = appStor.getnumber(tableid + 'rpp', 10);;
    itf.TotalRows = 0;
    itf.CurPage = 1;
    itf.NumPages = 1;
    itf.Params = [];
    itf.Filters = [];
    itf.FilBtnClass = function () {
        var cls = '';
        for (i = 0; i < this.Filters.length; i++) { if (this.Filters[i] > '') cls = 'btn-warning'; }
        return cls;
    }
    itf.clearFil = function () {
        for (i = 0; i < this.Filters.length; i++) { this.Filters[i] = ''; }
    }
    itf.setSort = function (newSort) {
        if (newSort == this.SortBy) this.SortDesc = !this.SortDesc; else this.SortDesc = false;
        this.SortBy = newSort;
        appStor.save(tableid + 'sort', newSort);
        refreshTableFunc();
    }
    itf.setRPP = function (nRPP) {
        this.RPP = nRPP;
        appStor.save(tableid + 'rpp', nRPP);
        refreshTableFunc();
    }
    itf.chPage = function (inc) {
        this.CurPage += inc;
        if (this.CurPage > this.NumPages) this.CurPage = this.NumPages;
        if (this.CurPage == 0) this.CurPage = 1;
        refreshTableFunc();
    }
    itf.setRows = function (aRes) {
        this.Rows = aRes.ReturnObj;
        this.TotalRows = aRes.TotalRows;
        this.NumPages = Math.floor((this.TotalRows + this.RPP - 1) / this.RPP);
        if (this.CurPage > this.NumPages) this.CurPage = this.NumPages;
        if (this.CurPage == 0) this.CurPage = 1;
    }
    return itf;
}

// email validation
app.factory('validationService', function () {
    return {
        Email: function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    };
});

app.filter('timeDiff', function () {
    return function (t1, t2) {
        if (t1 && t2) {
            var result = '';
            var seconds = Math.floor((new Date(t2) - new Date(t1)) / 1000);
            var tm = Math.floor(seconds / 3600);
            if (tm > 0) result = tm + 'h ';
            seconds = seconds - tm * 3600;
            tm = Math.floor(seconds / 60);
            if (tm > 0 | result.length > 0) result += (tm < 10 ? '0' + tm : tm) + 'm ';
            tm = seconds - tm * 60;
            result += (tm < 10 ? '0' + tm : tm) + 's';
            return result;
        } else return "-";
    };
});

app.filter('UTC2Local', function () {
    return function (date) {
        if (date == null) { return date }
        return new Date(date + 'Z');
    };
});

app.directive('convertToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (val) { return parseInt(val, 10); });
            ngModel.$formatters.push(function (val) { return '' + val; });
        }
    };
});

var appStor = {
    save: function (key, value) { if (typeof (Storage) !== "undefined") { localStorage.setItem(key, value); } },
    gettext: function (key, def) { if (typeof (Storage) !== "undefined") { var val = localStorage.getItem(key); if (val) return val; else return def; } else return def; },
    getnumber: function (key, def) { if (typeof (Storage) !== "undefined") { var val = localStorage.getItem(key); if (val && !isNaN(val)) return parseInt(val); else return def; } else return def; }
}
