app.registerCtrl('usersdetailsCtrl', function usersdetailsCtrl($scope, $http, $rootScope, $routeParams, appServices, $location, validationService, modalService) {
    $scope.curTab = 0;
    $scope.user = {};
    $scope.isEdit = false;
    $scope.tempuser = {};
    $scope.isCreate = false;
    $scope.user.Locked = true;
    $scope.lockUnlock = function () {
        appServices.doAction({ Token: $rootScope.token, ID: $scope.user.UserID }, 'user/toggleLock').then(function (d) {
            if (d.Code == 1) {
                $scope.user.Locked = !$scope.user.Locked;
                $rootScope.setMsg('User ' + ($scope.user.Locked ? 'Locked' : 'Unlocked') + ' successfully.', true);
            }
            else $rootScope.setMsg(d.Info);
        });
    }
    $scope.resetPW = function () {
        var modalOptions = { actionButtonText: 'Reset', headerText: 'Reset Password?', bodyText: 'Are you sure you want to reset the password for ' + $scope.user.FirstName + ' and email the password to the user?' };
        modalService.showModal({}, modalOptions).then(function (result) {
            appServices.doAction({ Token: $rootScope.token, ID: $scope.user.UserID }, 'user/resetpw').then(function (d) {
                if (d.Code == 1) $rootScope.setMsg('User\'s password has been reset and emailed to user.', true); else $rootScope.setMsg(d.Info);
            });
        });
    }
    $scope.impUser = function () {
        var modalOptions = { actionButtonText: 'Impersonate', headerText: 'Impersonate User', bodyText: 'You will start impersonating ' + $scope.user.FirstName + '. To get back to your own profile, you will need to sign out and sign-in again. Are you sure you want to do this?'};
        modalService.showModal({}, modalOptions).then(function (result) {
            appServices.doAction({ Token: $rootScope.token, ID: $scope.user.UserID }, 'user/impuser').then(function (d) {
                if (d.Code == 1) {
                    $rootScope.mUser = d.ReturnObj; $rootScope.token = d.Info;
                    $rootScope.setMsg('You are now impersonating ' + $rootScope.mUser.FullName, true); $location.path('/dashboard');
                    $cookies.put('TRUserToken', d.Info);
                } else $rootScope.setMsg(d.Info);
            });
        });
    }
    $scope.setEdit = function (editMode) {
        if (!editMode && $scope.isCreate) { $location.path('/users'); return };
        $scope.isEdit = editMode;
        if (editMode) {
            angular.copy($scope.user, $scope.tempuser);
           
            $scope.$broadcast('angucomplete-alt:changeInput', 'acManager', $scope.user.ManagerName);
            $scope.tmpCode = { originalObject: { ManagerID: $scope.user.ManagerID, ManagerName: $scope.user.ManagerName } };
        }
    }
    
    $scope.save=function()
    {
        if ( angular.isUndefined($scope.tempuser.FirstName) || $scope.tempuser.FirstName == '') { $rootScope.setMsg('First Name is required'); return; }
        if (angular.isUndefined($scope.tempuser.LastName) || $scope.tempuser.LastName == '') { $rootScope.setMsg('Last Name is required'); return; }
        if (!angular.isUndefined($scope.tempuser.Email) && ($scope.tempuser.Email != "" && $scope.tempuser.Email != null)) { if (!validationService.Email($scope.tempuser.Email)) { $rootScope.setMsg('Invalid Email Address'); return; } }
        if (angular.isUndefined($scope.tempuser.EmpID) || $scope.tempuser.EmpID == "") { $rootScope.setMsg('EmpId is required'); return; }
        if (angular.isUndefined($scope.tmpCode) || angular.isUndefined($scope.tmpCode.originalObject) || angular.isUndefined($scope.tmpCode.originalObject.ManagerID))
        { $rootScope.setMsg('Manager selection is required'); return; }
        if (angular.isUndefined($scope.tempuser.OfficeID)) { $rootScope.setMsg('Office is required'); return; }
        $scope.tempuser.CityOffice = $("#dOffice option:selected").text();
        $scope.tempuser.GenderName = $("#sGender option:selected").text();
        $scope.tempuser.ManagerID = $scope.tmpCode.originalObject.ManagerID;
        $scope.tempuser.ManagerName = $scope.tmpCode.originalObject.ManagerName;
        $scope.tempuser.UserID = ($routeParams.ID == 'new') ? 0 : $routeParams.ID;
        $scope.tempuser.Locked = $scope.user.Locked;
        $scope.tempuser.Role = 0;
        appServices.doAction({ Token: $rootScope.token, Obj: $scope.tempuser }, 'user/saveuser').then(function (d) {
            if (d.Code == 1) {
                if ($routeParams.ID == 0) { $location.path('/users'); return }
                angular.copy($scope.tempuser, $scope.user); $scope.setEdit(false);
                $rootScope.setMsg('User profile ' + ($scope.tempuser.UserID > 0 ? 'updated' : 'created') + ' successfully', true);
            }
            else $rootScope.setMsg(d.Info);
        });
    }

    // SessionLog
    $scope.getSessionLog = function () {
        if ($routeParams.ID == 'new') return;
        appServices.getTable($scope.SessionTable).then(function (d) {
            if (d.Code == 1) $scope.SessionTable.setRows(d); else $rootScope.setMsg(d.Info);
        });
    }
    $scope.SessionTable = getTableObj('SSS', $rootScope.token, 'logintime', 'user/getsessionlog', $scope.getSessionLog);
    $scope.SessionTable.Filters = [$routeParams.ID];
    $scope.SessionTable.SortDesc = true;

    $scope.getActionLog = function () {
        if ($routeParams.ID == 'new') return;
        appServices.getTable($scope.ActionTable).then(function (d) {
            if (d.Code == 1) $scope.ActionTable.setRows(d); else $rootScope.setMsg(d.Info);
        });
    }
    $scope.ActionTable = getTableObj('ACT', $rootScope.token, 'actiontime', 'user/getactionlog', $scope.getActionLog);
    $scope.ActionTable.Filters = [$routeParams.ID];
    $scope.ActionTable.SortDesc = true;

    // User Detail
    $scope.getUser = function () {
        if ($routeParams.ID == 'new') { $scope.setEdit(true); $scope.isCreate = true; }
        else {
            $rootScope.attParam = 'users:' + $routeParams.ID;
            appServices.doAction({ ID: $routeParams.ID, Token: $rootScope.token, Role: 0 }, 'user/getuser').then(function (d) {
                if (d.Code == 1) { $scope.user = d.ReturnObj; $scope.getActionLog(); $scope.getSessionLog(); } else $rootScope.goErrPage(d.Code);
                appServices.routeChange({ Value: 'User - ' + $scope.user.FirstName + ' ' + $scope.user.LastName, Token: $rootScope.token });
            });
        }
    }

    $scope.delete = function () {
        var modalOptions = { actionButtonText: 'Delete', headerText: 'Delete User?', bodyText: 'Are you sure you want to delete this user?' };
        modalService.showModal({}, modalOptions).then(function (result) {
            appServices.doAction({ ID: $routeParams.ID, Token: $rootScope.token }, 'user/deleteuser').then(function (d) {
                if (d.Code == 1) { $location.path('/users'); $rootScope.setMsg('User was deleted successfully', true); } else $rootScope.setMsg(d.Info);
            });
        });
    }

    $scope.goAccess = function () {
        if (!$rootScope.attParam) return;
        $('#AccModal').modal();
    }
    $scope.getLevel = function () {
        switch ($scope.access.BUID) {
            case 'HR': // HR
                break;
            case 'TRK': // TRK
                switch ($scope.access.LevelNum) {
                    case 3:
                        $scope.access.txt = 'Office';
                        $scope.access.title = 'OfficeName';
                        $scope.access.description = 'CityName';
                        $scope.access.search = 'OfficeName,CityName';
                        $scope.access.remote = '/api/lists/getofficelist?';
                        break;
                    case 4:
                        $scope.access.txt = 'Company';
                        $scope.access.title = 'CompName';
                        $scope.access.description = 'CompanyType';
                        $scope.access.search = 'CompName';
                        $scope.access.remote = '/api/lists/getcomplist?';
                        break;
                    case 5:
                        $scope.access.txt = 'Assignee';
                        $scope.access.title = 'FullName';
                        $scope.access.description = 'Designation';
                        $scope.access.search = 'FullName';
                        $scope.access.remote = '/api/lists/getassigneelist?';
                        break;
                }
                break;
            case 'CRM': // CRM
                break;
            case 'PD': // Property Database
                break;
        }

    }

    $scope.assignLevel = function () {
        if (angular.isUndefined($scope.access.BUID)) { $rootScope.setMsg('Business Unit is required'); return; }
        if ($scope.access == null) { $rootScope.setMsg('Level selection is required!'); return; }
        switch ($scope.access.BUID) {
            case 'HR': // HR
                break;
            case 'TRK': // 
                switch ($scope.access.LevelNum) {
                    case 3:
                        if (angular.isUndefined($scope.tmpCode)) { $rootScope.setMsg('Office selection is required'); return; }
                        $scope.access.RefId = $scope.tmpCode.originalObject.OfficeId;
                        break;
                    case 4:
                        if (angular.isUndefined($scope.tmpCode)) { $rootScope.setMsg('Company selection is required'); return; }
                        $scope.access.RefId = $scope.tmpCode.originalObject.CompId;
                        break;
                    case 5:
                        if (angular.isUndefined($scope.tmpCode)) { $rootScope.setMsg('User selection is required'); return; }
                        $scope.access.RefId = $scope.tmpCode.originalObject.UserID;
                        break;
                }
                break;
            case 'CRM': // CRM
                break;
        }
        $scope.lObj = { LevelNum: $scope.access.LevelNum, RefId: $scope.access.RefId, UserId: $scope.user.UserID, BUID: $scope.access.BUID };
        appServices.doAction({ Token: $rootScope.token, Obj: $scope.lObj }, "levels/savelevels").then(function (d) {
            if (d.Code == 1) {
                $rootScope.setMsg('Level assigned successfully', true);
                if (($scope.access.LevelNum < $scope.user.MinLevel) || $scope.user.MinLevel == 0) $scope.user.MinLevel = $scope.access.LevelNum;
                $scope.loadLevelList();
                $('#AccModal').modal("hide");
            } else $rootScope.setMsg(d.Info);
        });
    }

    $scope.loadLevelList = function () {
        appServices.doAction({ Token: $rootScope.token, ID: $routeParams.ID }, "levels/getlevels").then(function (d) {
            if (d.Code == 1) $scope.levels = d.ReturnObj;
        });
    }

    $scope.deleteLevel = function (idx) {
        var modalOptions = { actionButtonText: 'Revoke', headerText: 'Revoke Level', bodyText: 'Are you sure you want to revoke this level?' };
        modalService.showModal({}, modalOptions).then(function (result) {
            appServices.doAction({ Token: $rootScope.token, ID: $scope.levels[idx].LevelId }, 'levels/delete').then(function (d) {
                if (d.Code == 1) {
                    $scope.levels.splice(idx, 1);
                    $scope.getUser();
                    $rootScope.setMsg('The level was revoked successfully.', true);
                }
                else $rootScope.setMsg(d.Info);
            });
        });
    }
    $scope.getUser();
    $scope.loadLevelList();


    //// load OfficeList
    $scope.loadofficelist = function () {
        appServices.doAction({ Token: $rootScope.token }, "offices/getOfficelist").then(function (d) {
            if (d.Code == 1)
                $scope.offices = d.ReturnObj;
        });
    }
    $scope.loadofficelist();
});
