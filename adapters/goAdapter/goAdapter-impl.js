
function getVotes(contest, image) {
	
	var input = {
	    method : 'get',
	    path : '/get?contest='+contest+"&image="+image
	};
	
	
	return {result: WL.Server.invokeHttp(input).text};
}



function vote(contest, image) {
	
	var input = {
	    method : 'get',
	    path : '/inc?contest='+contest+"&image="+image
	};
	

	return {result: WL.Server.invokeHttp(input).text};
}

