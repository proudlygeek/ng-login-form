(function(){
  'use strict';

  var app = angular.module('loginApp', ['ngAnimate']);

    //
    // Controllers
    // 
    app.controller('LoginFormCtrl' , function($scope, $rootScope) {
      $scope.user = {
        gender: 'male'
      };

      $scope.login = function() {
        if ($scope.form.$valid && $scope.privacy) {
          $rootScope.$emit('login_successful', angular.copy($scope.user));
        }
      };

      $scope.genderPicker = function(gender) {
        $scope.user.gender = gender;
      };

      $scope.togglePrivacy = function() {
        $scope.privacy = !$scope.privacy;
      };
    });

    app.controller('FriendTableCtrl', function($scope, $rootScope, BackendService) {
      $scope.visible = false;
      $scope.predicate = 'name';
      $scope.reverse = false;

      $scope.order = function(predicate, reverse) {
        $scope.predicate = predicate;
        $scope.reverse = reverse;
      };

      $scope.addFriend = function(friend) {
        var index = $scope.people.indexOf(friend);
        $scope.people.splice(index, 1);
      };

      $rootScope.$on('login_successful', function(user) {
        BackendService.people(user).then(function(people) {
          $scope.visible = true;
          $scope.people = people;
        });
      });
    });

    //
    // Directives
    //
    app.directive('mustMatch', function() {
      return {
        restrict: 'A',
        scope: true,
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
          var check = function() {
            var confirm = scope.$eval(attrs.ngModel);
            var first = scope.$eval(attrs.mustMatch);

            return first == confirm;
          };

          scope.$watch(check, function(n) {
            ctrl.$setValidity('unique', n);
          });
        }
      };
    });

    app.directive('hasErrors', function($compile) {
      return {
        restrict: 'E',
        scope: true,
        transclude: true,
        link: function(scope, elem, attrs, ctrl) {
          scope.formName = attrs.formName;
          scope.field = attrs.field;
          scope.messages = scope.$eval(attrs.messages);

          var messages = '';
          for (var category in scope.messages) {
            messages += '<span ng-show="{{formName}}.{{field}}.$error.' + category + '">' + scope.messages[category] +'</span>';
          }

          var template = '<div ng-show="({{formName}}.{{field}}.$dirty || {{formName}}.$submitted) && {{formName}}.{{field}}.$invalid">' +
          '<span class="cross">×</span>' +
          '<div class="error" ng-show="({{formName}}.{{field}}.$dirty || {{formName}}.$submitted) && {{formName}}.{{field}}.$invalid">' +
          messages +
          '</div>' +
          '</div>';

          elem.replaceWith($compile(template)(scope));
        }
      };
    });

    //
    // Services
    //
    app.service('BackendService', function($http, $q) {
      return {
        people: function(user) {
          var endpoint = 'http://php.gbargel.li/people';

          return $http({
            method: 'GET',
            url: endpoint
          }).then(function(res) {
            if (res.data.status !== 'success') {
              $q.reject({'error': 'API Status is ' + res.data.status });
            }

            return res.data.people;
          });
        }
      };
    });

  })(window);
