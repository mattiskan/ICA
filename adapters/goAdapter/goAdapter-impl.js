
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


function getContests(){

	var input = {
	    method : 'get',
	    path : '/getContests'+contest
	};
	

	return {result: WL.Server.invokeHttp(input).text};
}


function getImages(contest) {
	
	var input = {
	    method : 'get',
	    path : '/getImages?contest='+contest
	};
	

	return {result: WL.Server.invokeHttp(input).text};
}

