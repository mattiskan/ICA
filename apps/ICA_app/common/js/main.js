function wlCommonInit(){

	/*
	 * Application is started in offline mode as defined by a connectOnStartup property in initOptions.js file.
	 * In order to begin communicating with Worklight Server you need to either:
	 * 
	 * 1. Change connectOnStartup property in initOptions.js to true. 
	 *    This will make Worklight framework automatically attempt to connect to Worklight Server as a part of application start-up.
	 *    Keep in mind - this may increase application start-up time.
	 *    
	 * 2. Use WL.Client.connect() API once connectivity to a Worklight Server is required. 
	 *    This API needs to be called only once, before any other WL.Client methods that communicate with the Worklight Server.
	 *    Don't forget to specify and implement onSuccess and onFailure callback functions for WL.Client.connect(), e.g:
	 *    
	 *    WL.Client.connect({
	 *    		onSuccess: onConnectSuccess,
	 *    		onFailure: onConnectFailure
	 *    });
	 *     
	 */
	
	// Common initialization code goes here
	
	loadFlowPage();
	
}

function loadFlowPage(){
	$("#content-holder").html("");
	
	
	getImages(1, function(result) {
		
		feed = $.parseJSON(result);
		
		console.log(feed);
		
		for(var i=0; i<feed.length; i++) {			
			var html = ['<div class="flow-entry">',
				            '<div class="food-image" style="background:url(\''+ feed[i].url+'\')"></div>',
				            '<span class="title">'+feed[i].title+'</span>',
				            '<div class="scores">',
				            '<img class="score" onclick="voteSimple('+feed[i].title+')" src="images/plus.png"/>',
				            '<span class="score">'+feed[i].votes+'</span>',
				            '<img  class="score" src="images/minus.png">',
				            '</div>', //scores
			            '</div>'].join("\n");
			$("#content-holder").append(html);
		}
	});
	
	
function upvoteSimple(title){
	upvote("1", title, function(){ } );
	console.log("upvoted");
}
	
	
	
}