/**
 * 
 */
function takePicture() {

    navigator.camera.getPicture(
        function(data) {
            var img = dom.byId('camera_image');
            img.style.visibility = "visible";
            img.style.display = "block";
            //img.src = "data:image/jpeg;base64," + data;
            img.src = data;
            dom.byId('camera_status').innerHTML = "Success";
        },
        function(e) {
            console.log("Error getting picture: " + e);
            dom.byId('camera_status').innerHTML = e;
            dom.byId('camera_image').style.display = "none";
        },
        { quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI, sourceType : navigator.camera.PictureSourceType.CAMERA});
};