define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphicsUtils"
],
function ( declare, Query, QueryTask, graphicsUtils ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				$("#" + t.id + "explorerSelect").chosen({allow_single_deselect:false, width:"98%"})
					.change(function(c){
						console.log(c.target.value);
						t.map.setMapCursor("pointer");
					});	
			},
			numberWithCommas: function(x){
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
        });
    }
);
