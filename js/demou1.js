/**
 * Created by think on 2016/6/18.
 */
//google map api key: AIzaSyCzmh5Og0nl6UvnZ_l-G66kU2J26X9999g
function initMap(){
    var picURL = "https://4e0e3522fc015cc0667c0ea370342a900f4ef2ed-www.googledrive.com/host/0BwaMR78EcMzEUzI1VWpicTFBbUk/";
    var positions = [
        {lat:37.3359949, lng:-121.8839107, title: "San Jose State Univ", addr: ["1 Washington Sq", "San Jose, CA95192"], type: "Public University", pic: "sjsu.jpg"},
        {lat: 37.338093, lng: -121.892494, title: "James Park", addr: ["N 2nd Street", "San Jose, CA95112"], type: "Park", pic: "james_park.jpg"},
        {lat: 37.328805, lng: -121.891323, title: "Ernst & Young", addr: ["303 S Almaden Blvd #1000", "San Jose, CA95110"], type: "Business Mgmt Consultant", pic: "ey.jpg"},
        {lat: 37.329257, lng: -121.877682, title: "Lowell School", addr: ["625 S 7th St", "San Jose, CA95112"], type: "Elementary School", pic: "lowell.jpg"},
        {lat: 37.325055, lng: -121.861442, title: "Happy Hollow Park", addr: ["1300 Senter Rd", "San Jose, CA95112"], type: "Zoo", pic: "happy_park.jpg"}
    ];
    var ViewModel = function(){
        var self = this;
        this.map = new google.maps.Map($(".map")[0], {
            center: {lat: 37.3359949,lng: -121.8839107},
            zoom: 15,
            mapTypeControl: true,
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            }
        });
        this.bounds = new google.maps.LatLngBounds();
        this.positions = ko.observableArray(positions);
        this.markers = ko.observableArray([]);
        this.infowindows = ko.observableArray([]);
        this.items = ko.observableArray([]);
        this.images = ko.observableArray([{
            "src": "",
            "alt": ""
        }]);
        this.inputValue = ko.observable("", "afterkeydown");
        this.liContent = ko.observableArray([]);//add li to ul in the .list element
        this.positions().forEach(function(value){
            var marker = new google.maps.Marker({
                position: {lat: value.lat, lng: value.lng},
                map: self.map,
                title: value.title,
                addr: value.addr,
                type: value.type,
                pic: value.pic
            });
            self.bounds.extend(marker.position);
            self.markers().push(marker);
            var infowindow = new google.maps.InfoWindow({
                content: value.title
            });
            self.infowindows().push(infowindow);
        });
        //console.log(self.items());
        this.markers().forEach(function(marker){
            var temp = {
                "liContent": marker.title,
                "liClick": function(){
                    markerClick(marker);
                },
                "statusFlag": ko.observable("block"),
                "backgroundColorFlag": ko.observable("white"),
                "fontColorFlag": ko.observable("black")
            };
            self.liContent.push(temp);
        });
        this.liContent().forEach(function(item){
            //console.log(item);
        });
        function createElement(ele, html, bindFlag, eventName, eventContent){
            //self.items().push()
            var bindContent = bindFlag == true? " data-bind='" + eventName + ": " + eventContent + "'" : "";
            return "<" + ele + bindContent + ">" + html + "</" + ele + ">";
            //return $(document.createElement(ele)).html(html)[0];
        }
        function mapFitBrowser(){  //set the map's size change with the size of the screen.
            var width = $(window).width();
            var height = $(window).height();
            $(".map").width(width).height(height);
        }
        this.windowLoad = function(){
            mapFitBrowser();
            $(".detail").height($(".side_menu").innerHeight() - $("form").innerHeight() - $(".individual").outerHeight(true) - 15);
            $(".toggle_menu").css("left", $(".side_menu").outerWidth(true));
        };
        this.windowResize = function(){
            mapFitBrowser();
            $(".detail").height($(".side_menu").innerHeight() - $("form").innerHeight() - $(".pic_background").innerHeight() - $(".info").innerHeight() - $(".tool_box").outerHeight(true) - 15);
            $(".toggle_menu").css("left", $(".side_menu").outerWidth(true));
        };
        this.markers().forEach(function(marker){
            marker.addListener("click", function(){//when another marker is clicked, the current marker's infoWindow will be closed
                markerClick(marker);
            });
        });
        this.infoSet = ko.observableArray([{
            "h3Content": "",
            "p0Content": "",
            "p1Content": ""
        }]);
        this.detailSet = ko.observableArray([{
            "h3Content": "",
            "pContent": ""
        }]);

        function markerClick(marker){
            //console.log("aaa");
            var index = self.markers().indexOf(marker);
            self.markers().forEach(function(marker){
                marker.setAnimation(null);//click any marker will stop other markers bounce event
                self.liContent()[self.markers().indexOf(marker)].backgroundColorFlag("white");
                self.liContent()[self.markers().indexOf(marker)].fontColorFlag("black");
            });
            self.images([{
                "src": picURL + marker.pic,
                "alt": marker.title
            }]);
            self.infowindows().forEach(function(infow){
                infow.close();//keep only one active infoWindow
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);
            self.infowindows()[self.markers().indexOf(marker)].open(self.map, marker);
            self.liContent()[index].backgroundColorFlag("rgb(43, 43, 43)");
            self.liContent()[index].fontColorFlag("white");
            /*---------------update .info content--------------------*/
            var ele = ".info";
            self.infoSet([{
                "h3Content": marker.title,
                "p0Content": marker.addr[0],
                "p1Content": marker.addr[1]
            }]);

            /*---------------update .detail content------------------*/
            var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=%data%&format=json&callback=?';
            $.ajax({
                url: wikiURL.replace("%data%", marker.title),
                type: "GET",
                dataType: "json",
                success: function(response){
                    self.detailSet([{
                        "h3Content": response[0],
                        "pContent": response[2].join(" ")
                    }]);
                },
                error: function(){
                    alert("Failure to load data");
                }
            });
            /*---------------update image of each location--------------*/
            //$(".pic_background").empty().append($(self.images()[self.markers().indexOf(marker)]));
        }

        this.infowindows().forEach(function(infow){
            infow.addListener("closeclick", function(){
                self.markers().forEach(function(marker){
                    marker.setAnimation(null);
                });
                self.inputClick();
            });
        });
        this.map.addListener("click", function(){//click somewhere else than the marker itself will close any active marker infoWindow
            self.infowindows().forEach(function(value){
                value.close();
            });
            self.markers().forEach(function(marker){
                marker.setAnimation(null);
                self.liContent()[self.markers().indexOf(marker)].backgroundColorFlag("white");
                self.liContent()[self.markers().indexOf(marker)].fontColorFlag("black");
            });
            self.inputValue("");
            self.inputClick();
            self.infoSet([{
                "h3Content": "",
                "p0Content": "",
                "p1Content": ""
            }]);
            self.detailSet([{
                "h3Content": "",
                "pContent": ""
            }]);
            self.images([{
                "src": "",
                "alt": ""
            }]);
        });
        this.toggleMenuClick = function(){//used to toggle side menu
            var self = ".toggle_menu";
            var direction = $(self).children("i").eq(0).hasClass("active")? -1: 0;
            var element = direction == -1? 1: 0;
            $(self).parent().animate({
                left: direction * $(".side_menu").outerWidth(true)
            }, "normal").queue(function(){
                $(self).parent().find(self + " i").removeClass("active");
                $(self).parent().find(self + " i").eq(element).addClass("active");
                $(self).parent().dequeue();
            });
        };
        this.detailStatus = ko.observable("block");
        this.listStatus = ko.observable("none");
        this.listClick = function(){
            //var self = ".individual";
            var flag = $(".individual").hasClass("active")? true: false;
            if(flag){
                $(".individual").removeClass("active");
                $(".detail").removeClass("active");
                $(".list").addClass("active");
                self.detailStatus("none");
                self.listStatus("block");
            }else{
                $(".individual").addClass("active");
                $(".detail").addClass("active");
                $(".list").removeClass("active");
                self.detailStatus("block");
                self.listStatus("none");
            }
        };
        this.showMarkersClick = function(){
            showmarkers(true);
            self.infowindows().forEach(function(infow){
                infow.close();
            });
        };
        this.hideMarkersClick = function(){
            hidemarkers();
        };
        function showmarkers(flag){
            var bounds = new google.maps.LatLngBounds();
            self.markers().forEach(function(marker){
                marker.setMap(self.map);
                bounds.extend(marker.position);
            });
            if(flag){
                self.map.fitBounds(bounds);
            }
        }
        function hidemarkers(){
            self.markers().forEach(function(marker){
                marker.setMap(null);
            });
        }
        this.formSubmit = function(){
            return false;
        };
        this.searchClick = function(){
            var inputValue = self.inputValue();
            self.markers().forEach(function(marker){
                if(inputValue == marker.title){
                    markerClick(marker);
                }
            });
        };
        //console.log(self.inputValue());
        this.inputKeyUp = function(){//keydown and keypress event cannot actively catch the value of input box,
            // because they run in front of input, only the keyup event will work and give the input value synchronously,
            // and the other advantage of keyup event is that we do not have to consider where the cursor is in the input
            // box and where the user press backspace
            var str = self.inputValue();
            self.markers().forEach(function(marker){
                if(str == "")self.liContent()[self.markers().indexOf(marker)].statusFlag("block");
                var flag = new RegExp(str, "i").test(marker.title);
                if(flag){
                    self.liContent()[self.markers().indexOf(marker)].statusFlag("block");
                    marker.setMap(self.map)
                }else {
                    self.liContent()[self.markers().indexOf(marker)].statusFlag("none");
                    marker.setMap(null)
                }
            });
            $("input").keyup(function(e){
                if(e.keyCode == 13){
                    self.searchClick();
                }
            });
        };
        this.inputClick = function(){
            self.inputValue("");
            self.liContent().forEach(function(obj){
                obj.statusFlag("block")
            });
            showmarkers(false);
            self.infowindows().forEach(function(infow){
                infow.close();
                self.liContent()[self.infowindows().indexOf(infow)].backgroundColorFlag("white");
                self.liContent()[self.infowindows().indexOf(infow)].fontColorFlag("black");
            });
            self.infoSet([{
                "h3Content": "",
                "p0Content": "",
                "p1Content": ""
            }]);
            self.detailSet([{
                "h3Content": "",
                "pContent": ""
            }]);
            self.images([{
                "src": "",
                "alt": ""
            }]);
        };
    };
    var viewmodel = new ViewModel();
    ko.applyBindings(viewmodel);
//});
}
function googleError(){
    alert("Failure to load google map");
}