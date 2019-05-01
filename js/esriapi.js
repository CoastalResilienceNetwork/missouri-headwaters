define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color", "dojo/_base/lang",
	"esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters", "esri/request", "esri/geometry/webMercatorUtils", "esri/map"
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color, lang,
			IdentifyTask, IdentifyParameters, esriRequest, webMercatorUtils, Map) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){
				// layer variables
				t.bndrylyr = 1;
				t.catchlyr = 2;	
				t.h12lyr = 3;
				t.streamlyr = 4;
				// print maps
				t.printMap = new Map(t.id + "printMap",{
         			basemap: "topo", center: [-104, 45], zoom: 5, showAttribution:false, isScrollWheel:false, logo:false
        		});
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.7});
				t.printLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.7});
				t.map.addLayer(t.dynamicLayer);
				t.dynamicLayer.setVisibleLayers([t.bndrylyr]);
				t.printMap.addLayer(t.printLayer);
        		t.printLayer.setVisibleLayers([t.bndrylyr]);
				t.dynamicLayer.on("load", function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					t.esriapi.buildToc(t);
					// Save and Share Handler					
					if (t.obj.stateSet == "yes"){
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						t.obj.stateSet = "no";
					}else{
						
					}
					var me = t.map.extent;
					// full extent click
					$(`#${t.feID}`).click(function() {
						t.map.setExtent(me);
						$(".groupDiv").slideUp("slow");
						$(`#${t.id}toc input[name='tocRadios']`).prop("checked",false);
						$(`#${t.descID}`).hide();
						t.map.graphics.clear();
						t.printMap.graphics.clear();
						$(`#${t.id}appReportWrap`).slideUp();
						t.obj.visibleLayers = [t.bndrylyr];
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						t.printLayer.setVisibleLayers(t.obj.visibleLayers);
					});
				});
				t.map.setMapCursor("pointer");

				t.sym1  = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([88,116,215,1]), 2), new Color([88,116,215]);
				$(`#${t.id}translide`).slider({ min: 0, max: 10, range: false, values: [t.obj.sliderVal],
   					change: function( event, ui ) {
						t.obj.sliderVal = 1-ui.value/10;
						t.dynamicLayer.setOpacity(t.obj.sliderVal);
						t.printLayer.setOpacity(t.obj.sliderVal);
					}
				})
				// map coordinates
				t.map.on("mouse-move", function(evt){
					//the map is in web mercator but display coordinates in geographic (lat, long)
          			var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
          			//display mouse coordinates
          			$("#coordinates").html(mp.x.toFixed(3) + ", " + mp.y.toFixed(3));
				});
          		t.map.on("mouse-drag", function(evt){
					//the map is in web mercator but display coordinates in geographic (lat, long)
          			var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
          			//display mouse coordinates
          			$("#coordinates").html(mp.x.toFixed(3) + ", " + mp.y.toFixed(3));
				});
				// map clicks
				t.huc12 = "";
				t.map.on("click",function(c){
					if (t.open == "yes"){
						t.map.setMapCursor("wait")
						t.map.graphics.clear();
						t.printMap.graphics.clear();
						t.reportArray = [];
						var q = new Query();
						var qt = new QueryTask(t.url + "/" + t.h12lyr );
						q.geometry = c.mapPoint;
						q.outFields = ["*"];
						q.returnGeometry = true;
						qt.execute(q, function(e){
							if (e.features[0]){
								if (t.huc12 == e.features[0].attributes.HUC_12){
									var qt1 = new QueryTask(t.url + "/" + t.catchlyr)
									qt1.execute(q, function(r){
										t.reportArray = r.features[0].attributes;
										r.features[0].setSymbol(t.sym1);
										t.layerDefs[t.catchlyr] = "OBJECTID = " + r.features[0].attributes.OBJECTID;
										t.dynamicLayer.setLayerDefinitions(t.layerDefs);
										t.printLayer.setLayerDefinitions(t.layerDefs);
										var index = t.obj.visibleLayers.indexOf(t.catchlyr)
										if (index == -1){
											t.obj.visibleLayers.push(t.catchlyr);
										}
										t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
										t.printLayer.setVisibleLayers(t.obj.visibleLayers);
										t.repGroup = "appReportWrap";
										t.esriapi.populateReport(t);
										$(`#${t.id}appReportWrap`).slideDown();
									});	
								}else{
									t.huc12 = e.features[0].attributes.HUC_12;
									if ( t.map.getLevel() < 11 ){
										t.map.centerAndZoom(c.mapPoint,11);
									}
									t.printExtent = e.features[0].geometry.getExtent().expand(1);
									t.layerDefs[t.streamlyr] = "huc_12 = " + t.huc12;
									t.layerDefs[t.h12lyr] = "HUC_12 = '" + t.huc12 + "'";
									t.layerDefs[t.catchlyr] = "HUC12 = '" + t.huc12 + "'";
									t.dynamicLayer.setLayerDefinitions(t.layerDefs);
									t.printLayer.setLayerDefinitions(t.layerDefs);
									var lyrs = [t.streamlyr,t.h12lyr]
									$.each(lyrs,function(i,v){
										var index = t.obj.visibleLayers.indexOf(v)
										if (index == -1){
											t.obj.visibleLayers.push(v);
										}
									})
									t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
									t.printLayer.setVisibleLayers(t.obj.visibleLayers);
									$(`#${t.id}appReportWrap`).slideUp();
								}
								t.map.setMapCursor("pointer")	
							}else{
								$(`#${t.id}appReportWrap`).slideUp();
								var lyrs = [t.streamlyr, t.catchlyr, t.h12lyr]
								$.each(lyrs,function(i,v){
									var index = t.obj.visibleLayers.indexOf(v)
									if (index > -1){
										t.obj.visibleLayers.splice(index,1);
									}
								})
								t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
								t.printLayer.setVisibleLayers(t.obj.visibleLayers);
								t.map.setMapCursor("pointer");
							}
						})
					}
				})
			},
			showCoordinates: function(t){
				//the map is in web mercator but display coordinates in geographic (lat, long)
          		var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
          		//display mouse coordinates
          		dom.byId("coordinates").innerHTML = mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
			},
			buildToc: function(t){
				//build elements from array
				t.minScale = [];
				var gdId = "";
				t.lrgBaseLyr = 0;
				t.layerInfos = [];
				$.each(t.layersArray,function(i,v){
					//build array of layer info objects
					var layersRequest = esriRequest({
					    url: t.url + "/" + v.id + "?f=pjson", content: { f: "json" }, handleAs: "json", callbackParamName: "callback"
					  });
					layersRequest.then(
						function(response) {
							t.layerInfos.push(response);
						}, function(error) {
							console.log("Error: ", error.message);
					});
					if (v.name == "Base Layers" || v.parentLayerId == 0){
						// record each baselayer id, largest will be stored.
						t.lrgBaseLyr = v.id
					}else{
						if (v.parentLayerId == -1){
							gdId = "toc" + v.id;
							$(`#${t.id}toc`).append(`
								<div class="toggle-btn">
									<input type="radio" id="t${gdId}" name="tocToggle" value="${v.id}"/>
									<label style="text-align:left;" for="t${gdId}">${v.name}</label>
								</div>
							`)
							$(`#${t.id}toc`).append(`
								<div class="groupDiv" id="${gdId}">
									<div class="tgd">${t.obj.groupingDesc[v.name]}</div>
								</div>
							`)
						}else{
							if (v.subLayerIds){
								$(`#${gdId}`).append(`<h5>${v.name}</h5>`)
							}else{
								var dis = "";
								if (v.minScale > 0){
									dis = "disabled";
									t.minScale.push({id:v.id, minScale:v.minScale})
								}
								var tocRadio = `<label class="form-component" for="${v.id}">
													<input ${dis} type="radio" id="${v.id}" name="tocRadios" value="${v.id}">
													<div class="check"></div>
													<span class="form-text">${v.name}</span>
												</label>`
								$(`#${gdId}`).append(tocRadio)
							}
						}
					}
				})
				// find and underline group layers labels (h5) with group layers for immediate children
				var lastName = "";
				$(".groupDiv").each(function(i,v){
					$(v).children().each(function(i1,v1){
						if (v1.nodeName == lastName && v1.nodeName == "H5"){
							$(v1).prev().css("text-decoration", "underline") 
						}
						lastName = v1.nodeName;
					})
				})
				// update layers on scale change
				t.map.on("extent-change",function(c){
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
				$(`#${t.id}toc input[name='tocToggle']`).click(function(c){
					$(".groupDiv").slideUp("slow");
					$(`#${t.id}toc input[name='tocRadios']`).prop("checked",false);
					t.esriapi.layersUpdate(t);
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					t.printLayer.setVisibleLayers(t.obj.visibleLayers);
					if ( !$(c.currentTarget).parent().next().is(":visible") ){
						$(c.currentTarget).parent().next().slideDown("slow");
					}else{
						$(c.currentTarget).prop("checked", false);
						$(`#${t.descID}`).hide();
						$(`#${t.id}slider-wrap`).hide();
					}
				})
				// Radio button clicks
				$(`#${t.id}toc input[name='tocRadios']`).click(function(c){
					t.esriapi.layersUpdate(t);
					t.obj.visibleLayers.push(c.currentTarget.value);
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					t.printLayer.setVisibleLayers(t.obj.visibleLayers);
					$.each(t.layerInfos,function(i,v){
						if (v.id == c.currentTarget.value){
							if (v.description.length > 0){
								$("#descText").html(v.description)
								$(`#${t.descID}`).show();
							}else{
								$(`#${t.descID}`).hide();
							}
							return false
						}
					})
					$(`#${t.id}slider-wrap`).show();
				});	
			},
			layersUpdate: function(t){
				var lyrs = [];
				$.each(t.obj.visibleLayers,function(i,v){
					if (v > 4){
						lyrs.push(v);
					}
				})
				$.each(lyrs,function(i,v){
					var index = t.obj.visibleLayers.indexOf(v)
					if (index > -1){
						t.obj.visibleLayers.splice(index,1);
					}
				})
			},
			populateReport: function(t){
				$(`#${t.id}${t.repGroup} span`).each(function(i,v){
					
					if (v.id.length > 0){
						var field = v.id.split("-").pop()
						// handles duplicate ids in print report
						if ( field.slice(-1) == "_" ){
							field = field.slice(0, -1);
						}
						// handles duplicate ids between app report and print report
						if ( field.slice(-2) == "_a" ){
							field = field.slice(0, -2);
						}
						if (typeof t.reportArray[field] != 'undefined'){
							$(`#${v.id}`).html(t.reportArray[field])
							//$("#" + v.id).css("color","#5d6165")	
						}
					}
				})
				$(`#${t.id}${t.repGroup} .noDecimals`).each(function(i,v){
					var num = Math.round($(v).html())
					$(v).html(num)
				})
				$(`#${t.id}${t.repGroup} .oneDecimal`).each(function(i,v){
					var num = parseFloat( $(v).html() ).toFixed(1);
					$(v).html(num)
				})
				$(`#${t.id}${t.repGroup} .twoDecimals`).each(function(i,v){
					var num = parseFloat( $(v).html() ).toFixed(2);
					$(v).html(num)
				})
			}			
		});
    }
);