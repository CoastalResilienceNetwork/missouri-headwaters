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
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
