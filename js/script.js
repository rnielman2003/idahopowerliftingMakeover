(function() {
    "use strict";
    var mod = angular.module("Mod", ['ngSanitize']);

    mod.controller("Ctrl", function($sce, $scope, $http, $timeout, $compile) {
        $scope.workout = [];
	$scope.date;
	$scope.showNext = false;
        $scope.title = "Dialog";

        $scope.openDialog = function(ytnum) {
            window.scrollTo(0, 0);
            $scope.message1 = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + ytnum);
            $scope.thetypeofdialog = 'youtube'
            $scope.dialogOpen = true;
        };

        $scope.openImg = function(imgnum, mess) {
            $scope.message1 = imgnum;
            $scope.message2 = mess;
            $scope.thetypeofdialog = 'image'
            $scope.dialogOpen = true;
        };
	
	$scope.navigatePrevious = function () {
            //move one week back if you can
            var $picker = $("#datepicker");
            var date=new Date($picker.datepicker('getDate'));
            date.setDate(date.getDate()-7); 
            $picker.datepicker('setDate', date);
            $('.ui-datepicker-current-day').click();
        }
        
        $scope.navigateNext = function () {
            //move one week ahead
            var $picker = $("#datepicker");
            var date=new Date($picker.datepicker('getDate'));   
            date.setDate(date.getDate()+7); 
            $picker.datepicker('setDate', date);
            $('.ui-datepicker-current-day').click();
        }
        

        $scope.handleClose = function() {
            $scope.dialogOpen = false;
            $scope.dialog2Open = false;
        };

        $scope.loadWorkouts = function(ddate) {
            var xsrf = $.param({
                date: ddate
            });
            var httpRequest = $http({
                method: 'POST',
                url: '/index.php/ajax/news_request',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: xsrf

            }).then(function(response) {
                $scope.workouts = response.data;
                var innerdiv = jQuery('#work .entrybody');
                $compile(innerdiv)($scope);

            });
        };

        $scope.searchWorkouts = function() {
            var xsrf = $.param({
                search: $scope.searchText
            });
            var httpRequest = $http({
                method: 'POST',
                url: '/index.php/ajax/search',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: xsrf

            }).then(function(response) {
                $scope.workouts = response.data;
                var innerdiv = jQuery('#work .entrybody');
                $compile(innerdiv)($scope);

            });
        };
    });

    mod.directive("datepicker", function() {
        return {
            restrict: "A",
            require: "ngModel",
            link: function(scope, elem, attrs, ngModelCtrl) {
                var updateModel = function(dateText) {
                    //scope.$apply(function() {
                        ngModelCtrl.$setViewValue(dateText);
                    //});
                };

                var options = {
                    onSelect: function(dateText) {
                    	var dateEnteredPlusSeven = new Date(dateText);
                    	dateEnteredPlusSeven.setDate(dateEnteredPlusSeven.getDate()+7);
		        var today = new Date();
		        var now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		        if (dateEnteredPlusSeven <= now) { 
		            scope.showNext = true; 
		        } else {
		            scope.showNext = false; 
		        }
                        updateModel(dateText);
                        angular.element($('#work')).scope().loadWorkouts(dateText);
                    }
                };

                // jqueryfy the element
                elem.datepicker(options);
            }
        };
    });

    mod.directive('dynamic', function($compile) {
        return {
            restrict: 'A',
            replace: true,
            link: function(scope, ele, attrs) {
                scope.$watch(attrs.dynamic, function(html) {
                    ele.html(html);
                    $compile(ele.contents())(scope);
                });
            }
        };
    });

    mod.directive('youtubeDialog', function($timeout) {
        return {
            scope: {
                closeButton: '@',
                closeCallback: '=',
                open: '@',
                title: '@',
                width: '@',
                height: '@',
                show: '@',
                hide: '@',
                autoOpen: '@',
                resizable: '@',
                closeOnEscape: '@',
                hideCloseButton: '@'
            },
            replace: false,
            transclude: true, // transclusion allows for the dialog 
            // contents to use angular {{}}
            template: '<div ng-transclude></div>', // the transcluded content 
            //is placed in the div
            link: function(scope, element, attrs) {


                // Specify the options for the dialog
                var dialogOptions = {
                    autoOpen: attrs.autoOpen || false,
                    title: attrs.title,
                    width: attrs.width || '595',
                    height: attrs.height || '395',
                    modal: attrs.modal || true,
                    position: 'center',
                    show: attrs.show || '',
                    hide: attrs.hide || '',
                    draggable: attrs.draggable || true,
                    resizable: attrs.resizable,
                    closeOnEscape: attrs.closeOnEscape || true,
                    //hideCloseButton: attrs.hideCloseButton || false,

                    close: function() {

                        $timeout(function() {
                            scope.$apply(scope.closeCallback());
                        }, 0);

                    },
                    open: function(event, ui) {
                        // Hide close button 

                       // if (hideCloseButton === true) {
                       //     $(".ui-dialog-titlebar-close", ui.dialog).hide();
                       // }
                    }
                };

                dialogOptions['buttons'] = [];

                if (attrs.closeButton) {
                    var btnOptions = {
                        text: 'close',
                        click: function() {
                            scope.$apply(scope.closeCallback());
                        }
                    };
                    dialogOptions['buttons'].push(btnOptions);
                }

                // Initialize the element as a dialog
                // For some reason this timeout is required, otherwise it doesn't work
                // for more than one dialog
                $timeout(function() {
                    $(element).dialog(dialogOptions);
                }, 0);

                // This works when observing an interpolated attribute
                // e.g {{dialogOpen}}.  In this case the val is always a string and so
                // must be compared with the string 'true' and not a boolean
                // using open: '@' and open="{{dialogOpen}}"
                attrs.$observe('open', function(val) {
                    if (val == 'true') {
                        $(element).dialog("open");
                    } else {
                        $(element).dialog("close");

                    }
                });

                // This allows title to be bound
                attrs.$observe('title', function(val) {
                    $(element).dialog("option", "title", val);
                });
            }
        };
    });


}());



angular.element($('#work')).ready(function() {
    var today = $.datepicker.formatDate('yy/mm/dd', new Date());
    angular.element($('#work')).scope().loadWorkouts(today);

    var totalSlides = 0;
    var currentSlide = 1;
    var contentSlides = "";
    var duration = 500;
    var slideHeight;

    function showPreviousSlide() {
        currentSlide--;
        contentHolderUp();
        updateButtons();
    }

    function showNextSlide() {
        currentSlide++;
        contentHolderDown();
        updateButtons();
    }

    function updateButtons() {
        if (currentSlide < totalSlides) {
            $("#slideshow-next").show();
        } else {
            $("#slideshow-next").hide();
        }
        if (currentSlide > 1) {
            $("#slideshow-previous").show();
        } else {
            $("#slideshow-previous").hide();
        }
    }

    $("#slideshow-previous").click(showPreviousSlide);
    $("#slideshow-next").click(showNextSlide);

    var totalHeight = 0;
    contentSlides = $(".slideshow-content");
    contentSlides.each(function(i) {
        totalHeight += this.clientHeight;
        slideHeight = this.clientHeight;
        totalSlides++;
    });
    $("#slideshow-holder").height(totalHeight);
    $("#slideshow-scroller").attr({
        scrollTop: 0
    });
    updateButtons();

    function contentHolderUp() {
        var scrollAmount = 0;

        $('#slideshow-scroller').animate({
            top: "+=" + slideHeight + "px"
        }, duration);
    }

    function contentHolderDown() {
        var scrollAmount = 0;
        $('#slideshow-scroller').animate({
            top: "-=" + slideHeight + "px"
        }, duration);
    }


});