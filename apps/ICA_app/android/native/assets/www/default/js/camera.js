
/* JavaScript content from js/camera.js in folder common */
/**
 * 
 */

var baseURL = "http://192.168.0.150:8080"
	
function url(sub){
	return baseURL + sub;
}

function takePicture() {

    navigator.camera.getPicture(
        function(data) {
           
            //img.style.visibility = "visible";
//            img.style.display = "block";
           
            
        	  /*	   $("#content_holder").load("imageUpload.html","", function(){
            	
            	 var img = $('#camera_image');
            	 img.show();
            	  // $('#camera_status').html("Success");
                   console.log("Success!");
                   //img.src = "data:image/jpeg;base64," + data;
//                   img.src = data;
                   img.attr("src", data);
                   //$('#camera_status').html(data);
  
            });
            */
        	
        	var imageURI = data;
            var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
            options.mimeType="image/jpeg";

            var params = {};
            params.contest = 1;
          

            options.params = params;

            var ft = new FileTransfer();
            ft.upload(imageURI, encodeURI(url("/upload")), win, fail, options);
         

        },
        function(e) {
            console.log("Error getting picture: " + e);
            $('#camera_status').html(e);
            $('#camera_image').hide();
        },
        { quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI, sourceType : navigator.camera.PictureSourceType.CAMERA});
};

function uploadImage() {
	var imageURI = $('#camera_image').attr('src');
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";

    var params = {};
    params.contest = 1;
  

    options.params = params;

    var ft = new FileTransfer();
    ft.upload(imageURI, encodeURI(url("/upload")), win, fail, options);
}

/*
function upvote(contest, image) {
    WL.Client.invokeProcedure( {
     	adapter : 'goAdapter',
    	procedure : 'vote',
    	parameters : [contest, image]
     }, {
    	 onSuccess: function(result){
    		 $("#score").html(result.invocationResult.result);
    	 }
     });
}*/

function getContests(callback) {
    WL.Client.invokeProcedure( {
     	adapter : 'goAdapter',
    	procedure : 'getContests',
     }, {
    	 onSuccess: function(result){
    		 callback(result.invocationResult.result);
    	 }
     });
}

function getImages(contest, callback) {
    WL.Client.invokeProcedure( {
     	adapter : 'goAdapter',
    	procedure : 'getImages',
    	parameters : [contest]
     }, {
    	 onSuccess: function(result){
    		 callback(result.invocationResult.result);
    	 }
     });
}


function upvote(contest, image, callback) {
    WL.Client.invokeProcedure( {
     	adapter : 'goAdapter',
    	procedure : 'vote',
    	parameters : [contest, image]
     }, {
    	 onSuccess: function(result){
    		 callback(result.invocationResult.result);
    	 }
     });
}
function getVotes(contest, image, callback) {
    WL.Client.invokeProcedure( {
     	adapter : 'goAdapter',
    	procedure : 'getVotes',
    	parameters : [contest, image]
     }, {
    	 onSuccess: function(result){
    		 callback(result.invocationResult.result);
    	 }
     });
}


function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    loadFlowPage();
}



function fail(error) {
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}

/*
function getBase64Image(img) {
	$('#camera_status').html("test1");

    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    $('#camera_status').html("test2");
    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    $('#camera_status').html("test3");
    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");
    $('#camera_status').html("test4");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function uploadImage() {
//	var imgPath = $('#camera_image').attr('src');
	
	var imgData = getBase64Image($('#camera_image'));
	
	var invocationData = {
			adapter: "imageUploadAdapter",
			procedure: "imageUpload",
			parameters : {
	            'user' : 1,
	            'data'    : imgData
	        }
	};
	$('#camera_status').html(imgData);
    return WL.Server.invokeHttp(invocationData);

}*/