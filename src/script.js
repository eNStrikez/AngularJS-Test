var app = angular.module('app', ['ngMaterial', 'ngMessages']);
const path = "https://www.bungie.net";

app.controller('searchController', function ($scope, $http){
	$scope.path = path;
	$http.get('destiny.itm').then(function(response) {
		$scope.items = response.data.items;
		for(let i = 0; i < $scope.items.length; i++){
			$scope.items[i] = JSON.parse($scope.items[i]);
		}
	});
});

app.controller('weaponController', function ($scope, $http){
	var url_string = window.location.href;
	var url = new URL(url_string);
	var hash = url.searchParams.get("hash");
	$scope.path = path;

	$http.get(hash + '.itm').then(function(response) {
		$scope.weapon = response.data;
        angular.forEach($scope.weapon.sockets.socketEntries, function(socket){
            $scope.sockets = [];
            $http.get(socket.singleInitialItemHash + '.itm').then(function(response) {
                $scope.sockets.push(response.data);
            });

            angular.forEach(socket.randomizedPlugItems, function(rndSocket){
                $http.get(rndSocket.plugItemHash + '.itm').then(function(response) {
                    $scope.sockets.push(response.data);
                });
            });
        });
	});

	$http.get('elements.itm').then(function(response) {
        $scope.elements = response.data.items;
        for(let i = 0; i < $scope.elements.length; i++){
            $scope.elements[i] = JSON.parse($scope.elements[i]);
        }
    });
    
});



app.filter('getElement', function(){
    return function(elements, weapon){
        var result = [];
        angular.forEach(elements, function(e){
            angular.forEach(weapon.damageTypeHashes, function(dmg){
                if (dmg == e.hash) {
                    result.push(e);
                }
            });
        });

        return result;
    }
});

app.filter('searchFor', function(){
	
	return function(arr, name){
		if(!name){
			return [];
		} else if (name.length < 3){
			return [];
		}
		
		var result = [];

		name = name.toLowerCase();

		angular.forEach(arr, function(item){
			if(item.displayProperties.name.toLowerCase().indexOf(name) !== -1 && item.itemCategoryHashes.includes(1)){
				result.push(item);
			}
		});

		return result;
	};

});

app.filter('getArray', function(){
    return function(arr){
        return arr;
    }
});

