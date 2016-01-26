var app=angular.module('app',[]);
app.controller('appcontroller',['$scope',function($scope){
   $scope.msg="hi this is angular app";
    $scope.oemp=[{
    	empName:'Meesam Zaidi',
    	empCity:'New Delhi',
    	empDOB:'02/05/1986'
    },
     {
    	empName:'Brajendra Yadav',
    	empCity:'Noida',
    	empDOB:'03/09/1988'
    },
    {
    	empName:'Brijesh Yadav',
    	empCity:'Gurgaon',
    	empDOB:'07/08/1982'
    }];
}]);