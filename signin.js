app.registerCtrl('signinCtrl', function signinCtrl($scope, $rootScope, $http, $location, appServices, $cookies, validationService) {
    $scope.loginInfo = { Email: '', Password: '', ip: '', Zone: new Date().getTimezoneOffset() };
    var googleUser = {};
    var gauth2;
    try {
        gapi.load('auth2', function () {
            gauth2 = gapi.auth2.init({ client_id: '759220122166-lfitto729rn6jj7bg4e7inoq5jvvfuks.apps.googleusercontent.com', cookiepolicy: 'single_host_origin' });
            gauth2.attachClickHandler(document.getElementById('aGoog'), {}, $scope.doGoogleLogin, function (error) { console.log(JSON.stringify(error, undefined, 2)); });
        });
    } catch (exception)
    { }
    $scope.doLogin = function () {  
        if ($scope.loginInfo.Email == '') { $rootScope.setMsg('Email Address is required'); return }
        else if ($scope.loginInfo.Password == '') { $rootScope.setMsg('Password is required'); return }
        else if (!validationService.Email($scope.loginInfo.Email)) { $rootScope.setMsg('Invalid Email Address'); return }
        $scope.loginInfo.GoogleID = null;
        appServices.doLogin($scope.loginInfo).then(function (d) {
            if (d.Code == 1) { // Login Success
                $rootScope.mUser = d.ReturnObj;
                $rootScope.token = d.Info;
                if ($scope.loginInfo.Remember) {
                    var expireDate = new Date();
                    expireDate.setDate(expireDate.getDate() + 90);
                    $cookies.put('TRUserToken', d.Info, { 'expires': expireDate });
                } else $cookies.put('TRUserToken', d.Info);
                $rootScope.getBUList();
                $location.path('/dashboard');
            } else {  // Login error
                $rootScope.setMsg(d.Info);
            }
        });
    }

    $scope.doGoogleLogin = function (gU) {
        var profile = gU.getBasicProfile();
        $scope.loginInfo.Email = profile.getEmail();
        $scope.loginInfo.Password = '';
        $scope.loginInfo.GoogleID = profile.getId();
        appServices.doLogin($scope.loginInfo).then(function (d) {
            if (d.Code == 1) { // Login Success
                $rootScope.mUser = d.ReturnObj;
                $rootScope.token = d.Info;
                $rootScope.getBUList();
                $cookies.put('UserToken', d.Info);
                $location.path('/dashboard');
            } else {  // Login error
                $rootScope.setMsg(d.Info);
            }
        });
    }
});













<div class="col-sm-6 col-lg-5">
                            Log End Date:<p class="input-group">
                                <input type="text" id="logend" class="form-control requires" ng-click="logend=true" uib-datepicker-popup="dd MMM yyyy" ng-model="tempTruckLog.LogEnd"
                                       is-open="logend" close-text="Close" readonly />
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-default" ng-click="logend=true"><i class="fa fa-calendar"></i></button>
                                </span>
                            </p>
                        </div>








