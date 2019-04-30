define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphicsUtils"
],
function ( declare, Query, QueryTask, graphicsUtils ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				$("#" + t.id + "visLayerWrap input").click(function(c){
					var val = c.currentTarget.value;
					$.each(t.layersArray,function(i,v){
						if (v.name == val){
							if (c.currentTarget.checked){	
								t.obj.visibleLayers.push(v.id)
							}else{
								var index = t.obj.visibleLayers.indexOf(v.id)
								if (index > -1){
									t.obj.visibleLayers.splice(index,1)
								}
							}	
							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers)
							t.printLayer.setVisibleLayers(t.obj.visibleLayers)
						}
					});		
				})
				$("#sldr").slider({ min: 0, max: 10, range: false, values: [1] })
				
				$("#" + t.id + "previewReport").click(function(c){
					// hide controls and show report
					$(`#${t.id}top-wrap`).hide();
					$(`#${t.id}watershed-report`).show();
					// expand plugin width
					$('#' + t.id).parent().parent().css("width","720");
					// set map extent
					t.printExtent = t.map.extent;
            		t.printMap.setExtent(t.printExtent);
            		// add legend
            		$(`#${t.id}printLegend`).empty();
            		//$(`.layer-legends`).clone().appendTo($(`#${t.id}printLegend`))
					$(`.legend-layer`).each(function(i,v){
						$(v).children().each(function(i1,v1){
							if ( !$(v1).hasClass("expand") && !$(v1).hasClass("collapse") ){
								$(v1).clone().appendTo($(`#${t.id}printLegend`));
							}
							if (i1 > 8){
								$(".printLegend div").css("max-width","150px")
							}	
						})
					})
					// Fill in report
		          	t.repGroup = "watershed-report";
		          	t.esriapi.populateReport(t);
		          	$(`#mapCover`).show();
				})
				$("#" + t.id + "backToControls").click(function(c){
					$(`#mapCover`).hide();
					// reduce plugin width
					$('#' + t.id).parent().parent().css("width","500");
					// hide controls and show report
					$(`#${t.id}top-wrap`).show();
					$(`#${t.id}watershed-report`).hide();
				});	
				$("#" + t.id + "printReport").click(function(c){
					$('#' + t.id).parent().parent().find(".plugin-print").trigger("click");
				});	
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
