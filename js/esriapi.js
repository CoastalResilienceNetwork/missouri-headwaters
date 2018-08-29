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
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.5});
				t.map.addLayer(t.dynamicLayer);
				t.dynamicLayer.setVisibleLayers([1]);
				t.dynamicLayer.on("load", function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					t.esriapi.buildToc(t);
					// Save and Share Handler					
					if (t.obj.stateSet == "yes"){
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						t.obj.stateSet = "no";
					}	
				});
				t.map.setMapCursor("pointer");

				t.sym1  = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([88,116,215,1]), 2), new Color([88,116,215]);
				
				// map clicks
				t.huc12 = "";
				t.map.on("click",function(c){
					if (t.open == "yes"){
						t.map.setMapCursor("wait")
						t.map.graphics.clear();
						t.reportArray = [];
						var q = new Query();
						var qt = new QueryTask(t.url + "/3" );
						q.geometry = c.mapPoint;
						q.outFields = ["*"];
						q.returnGeometry = true;
						qt.execute(q, function(e){
							if (e.features[0]){
								if (t.huc12 == e.features[0].attributes.HUC_12){
									var qt1 = new QueryTask(t.url + "/4")
									qt1.execute(q, function(r){
										t.reportArray = r.features[0].attributes;
										r.features[0].setSymbol(t.sym1);
										t.map.graphics.add(r.features[0]);
									});	
								}else{
									t.huc12 = e.features[0].attributes.HUC_12;
									t.layerDefs[3] = "HUC_12 = '" + t.huc12 + "'";
									t.layerDefs[4] = "HUC12 = '" + t.huc12 + "'";
									t.dynamicLayer.setLayerDefinitions(t.layerDefs);
									var index = t.obj.visibleLayers.indexOf(3)
									if (index == -1){
										t.obj.visibleLayers.push(3);
									}
									var index = t.obj.visibleLayers.indexOf(4)
									if (index == -1){
										t.obj.visibleLayers.push(4);
									}
									t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
								}
								t.map.setMapCursor("default")	
							}
						})
					}
				})
			},
			buildToc: function(t){
				//build elements from array
				t.minScale = [];
				var gdId = "";
				$("#" + t.id + "toc").append("<h4>View Supporting Layers</h4>")
				$.each(t.layersArray,function(i,v){
					if (v.name == "Base Layers" || v.parentLayerId == 0){
						// skip the base layers
					}else{
						if (v.parentLayerId == -1){
							gdId = "toc" + v.id;
							$("#" + t.id + "toc").append("<div class='toggle-btn'><input type='radio' id='t" + gdId + "' name='tocToggle' value='" + v.id + "'/><label for='t" + gdId + "'>" + v.name + "</label></div>")
							$("#" + t.id + "toc").append("<div class='groupDiv' id='" + gdId + "'></>")
						}else{
							if (v.subLayerIds){
								$("#" + gdId).append("<h5>" + v.name + "</h5>")
							}else{
								var dis = "";
								if (v.minScale > 0){
									dis = "disabled";
									t.minScale.push({id:v.id, minScale:v.minScale})
								}
								var tocRadio = '<label class="form-component" for="' + v.id + '">' +
													'<input ' + dis + ' type="radio" id="' + v.id + '" name="tocRadios" value="' + v.id + '">' +
													'<div class="check"></div>' +
													'<span class="form-text">' + v.name + '</span>' +
												'</label>'
								$("#" + gdId).append(tocRadio)
							}
						}
					}
				})
				// update layers on scale change
				t.map.on("extent-change",function(c){
					console.log(c.lod)
					var scale = c.lod.scale;
					$.each(t.minScale,function(i,v){
						if (scale < v.minScale){
							$("#" + v.id).prop("disabled",false);
						}else{
							$("#" + v.id).prop("disabled",true);
						}
					});
				});
				// Open and close toc groups
				$("#" + t.id + "toc input[name='tocToggle']").click(function(c){
					$(".groupDiv").slideUp("slow");
					$("#" + t.id + "toc input[name='tocRadios']").prop("checked",false);
					t.obj.visibleLayers = [1]
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					if ( !$(c.currentTarget).parent().next().is(":visible") ){
						$(c.currentTarget).parent().next().slideDown("slow");
					}else{
						$(c.currentTarget).prop("checked", false)
					}
				})
				// Radio button clicks
				$("#" + t.id + "toc input[name='tocRadios']").click(function(c){
					t.obj.visibleLayers = [1, c.currentTarget.value]
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				});	
			},
			populateReport: function(t){
				$("#" + t.id + "watershed-report span").css("color","red")
				$("#" + t.id + "watershed-report span").each(function(i,v){
					if (v.id.length > 0){
						var field = v.id.split("-").pop()
						if ( field.slice(-1) == "_" ){
							field = field.slice(0, -1);
							console.log(field)
						}
						if (typeof t.reportArray[field] != 'undefined'){
							$("#" + v.id).html(t.reportArray[field])
							$("#" + v.id).css("color","#5d6165")	
						}
					}else{
						$(v).css("color","#5d6165")
					}
				})
				$("#" + t.id + "watershed-report .noDecimals").each(function(i,v){
					var num = Math.round($(v).html())
					$(v).html(num)
				})
				$("#" + t.id + "watershed-report .twoDecimals").each(function(i,v){
					var num = parseFloat( $(v).html() ).toFixed(2);
					$(v).html(num)
				})
			}			
		});
    }
);