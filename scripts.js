var canvas = new fabric.Canvas('canvas');
var background = ['0.png','1.png'], // all possible backgrounds
mode = 0,
max_params = [1280, 720], // max size of canvas (to prevent white spots on image)
extensions = ['.png', '.jpg', '.jpeg'],
post_url = 'localhost:5000',
get_url = 'localhost:5000',
image_url = 'localhost:5000',
delay = 500, // interval between get requests
face_id = '', 
face_url = '', 
image_full_link = ''; // do not touch 

window.onload = window.onresize = function() {
var canv_params = [window.innerWidth * 0.9,
                    window.innerHeight * 0.9];

for (let i = 0; i <= canv_params.length; i++) {
    if (canv_params[i] > max_params[i]){
        canv_params[i] = max_params[i]
        }
    }

    canvas.setWidth( canv_params[0] );
    canvas.setHeight( canv_params[1] );
    canvas.calcOffset();
    canvas.renderAll();

}


window.ondragover = function(e) {e.preventDefault()}
window.ondrop = function(e) {e.preventDefault(); draw(e.dataTransfer.files[0]); }


function switch_bg(move){
    if (move == 1){
        mode += 1
        if (mode == background.length){
            mode = 0
        }
    }
    else{
        mode -= 1
        if (mode < 0){
            mode = background.length - 1
        }
    }
    console.log(mode);
    draw_bg();
}

function draw_bg(){
    fabric.Image.fromURL(background[mode], function(img) {
        img.cacheKey = 'background'
        img.crossOrigin = 'Anonymous'
        img.selectable = false
        canvas.add(img);
        var objectx = canvas.getObjects()
        try{
            if (objectx[objectx.length - 2].cacheKey == 'face'){
                draw_face(face_url)
            }
        }catch (error) {
            console.error(error);
        }
        if (objectx.length > 1){
        canvas.remove(objectx[0])
        }
        console.log(objectx)
      });
}
draw_bg() 

function draw_face(url){
    fabric.Image.fromURL(url, function(img){
        img.cacheKey = 'face'
        img.crossOrigin = 'Anonymous'
        canvas.add(img);
    })
}

function download_img(el) {
        var canv = document.getElementById("canvas")
        var ctx = canv.getContext('2d');
        var image = ctx.getImageData(0,0,canv.width, canv.height);
        el.href = image

}

function upload(){
    $('<input type="file" multiple>').on('change', function () {
        if (this.files.length == 1){
            var file = this.files[0],
            check = false;
            for(el in extensions){
                if (file.name.indexOf(extensions[el]) != -1){
                    check = true;
                    break;
                }
            }
            if (check){
                var encdata = []
                var result = img_converter(file)
                encdata.push(encodeURIComponent('Image') + '=' + encodeURIComponent(result));
                encdata = encdata.join('&').replace( /%20/g, '+');
                async function postData(url){
                    const options = {method: 'POST', 
                    mode: 'cors', 
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'},
                    body: encdata
                    };
                    const response = await fetch(post_url, options);
                    return response.json()
                    .catch(err => {console.log(err)}
                    )
                }
                postData(url)
                .then(result => {
                    face_id = result.id
                    get_url += face_id
                    for (var i = 0; i < 15; i++){
                        if (get()){
                            break
                        }
                    }
                     
                    
                })
            }
            else{
                console.log('wrong file')
            }            
        }
    }).click();
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
})

async function img_converter(file) {
    var result = await toBase64(file);
    return result
}


setInterval(get, delay);
function get(){
    fetch(get_url)
    .then(response => response.json())
    .then(data => {
        if (data.status == 'SUCCESS'){
            face_url = image_url + data.url
            draw_face(face_url)
            return true
        }
        else{
            return false
        }
    })
}