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
	
	$("#content-holder").load("flowEntry.html");
	return;
	
	loadFlowPage();
	
	
}

function loadFlowPage(){

	
	var feed = [
	   { url: "images/food.jpg", title: "test", votes: 5},
	   { url: "images/food.jpg", title: "test1", votes: 8},
	   { url: "images/food.jpg", title: "test", votes: 2},
	   { url: "images/food.jpg", title: "test3", votes: 4}
	];
	
	for(var i=0; i<4; i++) {
		
		var html = ['<div class="flow-entry">',
		            	'<div class="food-image" style="background:url(\'' + feed[i].url + '\')"></div>',
		            	'<p> Welcome <span class="username">'+ feed[i].title +'</span>!</p>',
		            	'<p class="votes">'+ feed[i].votes +'</p>',
		            '</div>'].join('\n');
		$("#content-holder").append(html);
	}
	
	
	
}