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
						}
					});		
				})
				$("#sldr").slider({ min: 0, max: 10, range: false, values: [1] })
				
				$("#" + t.id + "printReport").click(function(c){
					$('#' + t.id).parent().parent().find(".plugin-print").trigger("click");
				})
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
