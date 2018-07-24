define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang",
	"esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color, lang,
			IdentifyTask, IdentifyParameters) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:1});
				t.map.addLayer(t.dynamicLayer);
				t.dynamicLayer.setVisibleLayers([1]);
				t.dynamicLayer.on("load", function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					// Save and Share Handler					
					if (t.obj.stateSet == "yes"){
						//extent
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						t.obj.stateSet = "no";
					}	
				});
				t.map.setMapCursor("pointer");

				// map clicks
				t.map.on("click",function(c){
					if (t.open == "yes"){
						t.reportArray = [];
						var q = new Query();
						var qt = new QueryTask(t.url + "/2" );
						q.geometry = c.mapPoint;
						q.outFields = ["*"];
						q.returnGeometry = true;
						qt.execute(q, function(e){
							if (e.features[0]){
								t.reportArray = e.features[0].attributes;
								console.log(t.reportArray)
								// setTimeout(function (){
									t.esriapi.populateReport(t);
								// }, 1000);
							}	
						})
					}
				})
			},
			populateReport: function(t){
				$("#" + t.id + "watershed-report span").css("color","red")
				$("#" + t.id + "watershed-report span").each(function(i,v){
					if (v.id.length > 0){
						var field = v.id.split("-").pop()
						console.log(t.reportArray[field])
						if (typeof t.reportArray[field] != 'undefined'){
							$("#" + v.id).html(t.reportArray[field])
							$("#" + v.id).css("color","#5d6165")	
						}
					}else{
						$(v).css("color","#5d6165")
					}
				})
			}			
		});
    }
);