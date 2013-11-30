var canvas = new fabric.Canvas('sketch');
canvas.selection = false;

fabric.Image.fromURL('/static/img/boot.jpg', function(img) {
    console.log(img.width, img.height);
    canvas.setWidth(img.width);
    canvas.setHeight(img.height);
    canvas.setBackgroundImage('/static/img/boot.jpg', canvas.renderAll.bind(canvas), {
        originX: 'left',
        originY: 'top'
    });
});

var erasing = false;
var icons = new Object();
var lines = new Object();
var brushSize = 50;
var brushColor = "rgb(0,0,0)"
var lastMouse = {
    x: 0,
    y: 0
};

function draw(coords, color, size) {
    var path = 'M ' + coords[0] + ' ' + coords[1] + ' L ' + coords[2] + ' ' + coords[3] + ' z';
    var pos = coords[0] + ' ' + coords[1] + ' ' + coords[2] + ' ' + coords[3];
    lines[pos] = new fabric.Path(path, {
        pos: pos,
        stroke: color,
        strokeWidth: size,
        strokeLineJoin: 'round',
        strokeLineCap: 'round',
        selectable: false
    });
    return lines[pos];
}

var rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: 'red',
    width: 40,
    height: 40
});

var rect2 = new fabric.Rect({
    hash: "heinoob",
    left: 500,
    top: 200,
    fill: 'blue',
    width: 40,
    height: 40
});


var line = new fabric.Line([200, 200, 201, 202], {
    strokeWidth: 15,
    stroke: 'red'
});


var object = {
    name: "hei",
    bullshit: "hei"
}

canvas.on('mouse:down', function(e) {
    lastMouse = canvas.getPointer(e.e);
    if (canvas.getActiveObject() === null) {
        canvas.on('mouse:move', draw_move);
    }
});


canvas.on('mouse:up', function(e) {
    canvas.off('mouse:move');
});

function change_cursor(){
    var cursorSize = brushSize;
    if (cursorSize < 10){
        cursorSize = 10;
    }
    var cursorColor = brushColor;
    var cursorGenerator = document.createElement("canvas");
    cursorGenerator.width = cursorSize;
    cursorGenerator.height = cursorSize;
    var ctx = cursorGenerator.getContext("2d");

    var centerX = cursorGenerator.width/2;
    var centerY = cursorGenerator.height/2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, (cursorSize/2)-4, 0, 2 * Math.PI, false);
    if (erasing){
         ctx.fillStyle = 'white';
         ctx.fill()
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = cursorColor;
    ctx.stroke();

    canvas.defaultCursor = "url(" + cursorGenerator.toDataURL("image/png") + ") " + cursorSize/2 + " " + cursorSize/2 + ",crosshair";


}

change_cursor();

function draw_move(e) {
    var mouse = canvas.getPointer(e.e);
    if (!erasing) {
        canvas.add(draw([lastMouse.x, lastMouse.y, mouse.x, mouse.y], brushColor, brushSize));
        if (TogetherJS.running) {
            TogetherJS.send({
                type: "draw",
                coords: [lastMouse.x, lastMouse.y, mouse.x, mouse.y],
                color: brushColor,
                size: brushSize
            });
        }
        lastMouse = mouse;
    }
    else if (erasing) {
        for (var line in lines) {
            var posList = lines[line].pos.split(' ');
            fromX = Number(posList[0]);
            fromY = Number(posList[1]);
            toX = Number(posList[2]);
            toY = Number(posList[3]);
            if (((Math.abs(mouse.x-fromX) > 70) || ((Math.abs(mouse.x-toX)) > 70))) {
                continue;
            }
            else if (((Math.abs(mouse.y-fromY) > 70) || ((Math.abs(mouse.y-toY)) > 70))) {
                continue;
            }
            slope = (toY-fromY)/(toX-fromX);
            if (fromX < toX) {
                for (var x=fromX; x<=toX; x++) {
                    y = fromY + ((x-fromX)*slope);
                    if ((mouse.x-brushSize <= x <= mouse.x+brushSize+15) && (mouse.y-brushSize-15 <= y <= mouse.y+brushSize)) {
                        canvas.remove(lines[line]);
                        delete lines[line];
                    }
                }
            }
            else {
                for (var x=fromX; x>=toX; x--) {
                    y = fromY + ((x-fromX)*slope);
                    if ((mouse.x-brushSize <= x <= mouse.x+brushSize+15) && (mouse.y-brushSize-15 <= y <= mouse.y+brushSize)) {
                        canvas.remove(lines[line]);
                        delete lines[line];
                    }
                }
            }
        }
    }
}

function add_icon(icon, hash) {
    var oHash = hash;
    fabric.Image.fromURL(icon, function(img) {
        if (!hash) {
            hash = Math.random().toString(36);
        }z
        var oImg = img.set({
            hash: hash,
            left: 100,
            top: 100
        }).scale(0.5);
        canvas.add(oImg).renderAll();
        canvas.setActiveObject(oImg);
        icons[hash] = oImg;
        if (TogetherJS.running && !oHash) {
            TogetherJS.send({
                type: "newIcon",
                hash: hash,
                url: icon
            });
        }
    });
}
TogetherJS.hub.on("newIcon", function(msg) {
    if (!msg.sameUrl) {
        return;
    }
    add_icon(msg.url, msg.hash);
});

var randomname = "abcdefgh";
rect.hash = randomname;
icons[randomname] = rect;

canvas.on('object:rotating', function(e) {
    var sendObject = new Object();
    sendObject['hash'] = e.target.hash;
    sendObject['angle'] = e.target.angle;
    if (TogetherJS.running) {
        TogetherJS.send({
            type: "sendObject",
            sendObject: sendObject
        });
    }
});

canvas.on('object:scaling', function(e) {
    var sendObject = new Object();
    sendObject['hash'] = e.target.hash;
    sendObject['scaleX'] = e.target.scaleX;
    sendObject['scaleY'] = e.target.scaleY;
    sendObject['width'] = e.target.width;
    sendObject['height'] = e.target.height;
    sendObject['left'] = e.target.left;
    sendObject['top'] = e.target.top;
    sendObject['oCoords'] = e.target.oCoords;
    if (TogetherJS.running) {
        TogetherJS.send({
            type: "sendObject",
            sendObject: sendObject
        });
    }
});

canvas.on('object:moving', function(e) {
    var sendObject = new Object();
    sendObject['hash'] = e.target.hash;
    sendObject['left'] = e.target.left;
    sendObject['top'] = e.target.top;
    sendObject['oCoords'] = e.target.oCoords;
    if (TogetherJS.running) {
        TogetherJS.send({
            type: "sendObject",
            sendObject: sendObject
        });
    }
});


TogetherJS.hub.on("sendObject", function(msg) {
    if (!msg.sameUrl) {
        return;
    }
    var sendObject = msg.sendObject;
    var changeObject = icons[sendObject.hash];
    for (var key in sendObject) {
        icons[changeObject.hash][key] = sendObject[key];
    }
    icons[sendObject.hash].setCoords();
});
canvas.add(line);
canvas.add(rect);
canvas.add(rect2);

TogetherJS.hub.on("draw", function (msg) {
    if (!msg.sameUrl) {
        return;
    }
    canvas.add(draw(msg.coords, msg.color, msg.size));
});

$('.addIcon').click(function(){
    add_icon('/static/img/grenade.png', false);
});

$('.eraserIcon').click(function(){
    if (erasing) {
        erasing = false;
    }
    else {
        erasing = true;
    }
    change_cursor();
});


/*
var canvas = document.getElementById ('sketch');
var context = canvas.getContext('2d');

var bgCanvas = document.getElementById ('background');
var bgContext = bgCanvas.getContext('2d');

bgCanvas.width = 800;
bgCanvas.height = 600;
canvas.width = bgCanvas.width;
canvas.height = bgCanvas.height;

var currentBackground;
var init = false;
var initDrawings;

setBackground('/static/img/boot.jpg');

// Brush Settings
context.lineWidth = 1;
context.lineJoin = 'round';
context.lineCap = 'round';
context.strokeStyle = '#000';

// Set brush size
function setSize(size) {
    context.lineWidth = size;

}

// Sets eraser mode
function eraser() {
    context.globalCompositeOperation = "destination-out";
    context.strokeStyle = "rgba(0,0,0,1)";

}

// Set brush color
function setColor(color) {
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = color;

}

// Initialize last mouse
var lastMouse = {
    x: 0,
    y: 0
};

// Event listeners for mouse
canvas.addEventListener('mousedown', function(e) {
    lastMouse = {
        x: e.pageX - this.offsetLeft,
        y: e.pageY - this.offsetTop
    };
    canvas.addEventListener('mousemove', move, false);
}, false);

canvas.addEventListener('mouseout', function() {
    canvas.removeEventListener('mousemove', move, false);
}, false);

canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', move, false);
}, false);

function move(e) {
    var mouse = {
        x: e.pageX - this.offsetLeft,
        y: e.pageY - this.offsetTop
    };
    draw(lastMouse, mouse, context.strokeStyle, context.lineWidth, context.globalCompositeOperation);
    if (TogetherJS.running) {
        TogetherJS.send({
            type: "draw",
            start: lastMouse,
            end: mouse,
            color: context.strokeStyle,
            size: context.lineWidth,
            compositeoperation: context.globalCompositeOperation
        });
    }
    lastMouse = mouse;
}

// Sets background and sends message
function backgroundClicked(background) {
    setBackground(background);
    if (TogetherJS.running) {
        console.log("TJS bg msg sent");
        TogetherJS.send({
            type: "setBackground",
            background: background
        });
    }
}

// Sets background
function setBackground(background) {
    currentBackground = background;
        var bgimg = new Image();
        bgimg.src = background;
        bgimg.onload = function() {
            var oldLineWidth = context.lineWidth;
            var oldLineJoin = context.lineJoin;
            var oldLineCap = context.lineCap;
            var oldStrokeStyle = context.strokeStyle;

            bgCanvas.width = bgimg.width;
            bgCanvas.height = bgimg.height;
            canvas.width = bgCanvas.width;
            canvas.height = bgCanvas.height;
            bgContext.drawImage(bgimg,0,0);

            context.lineWidth =  oldLineWidth;
            context.lineJoin = oldLineJoin;
            context.lineCap = oldLineCap;
            context.strokeStyle = oldStrokeStyle;
            if (init) {
                context.drawImage(initDrawings, 0,0);
                init = false;
            }
    }
}



// Reset background and sends reset message
function resetClicked() {
    resetBackground();
    if(TogetherJS.running) {
        TogetherJS.send({
            type: "resetBackground"
        });
    }
}

// Reset background
function resetBackground() {
    bgContext.clearRect(0,0 , bgCanvas.width, bgCanvas.height);
    bgContext.fillRect (0, 0, bgCanvas.width, bgCanvas.height);
    setBackground('/static/img/boot.jpg')
}
// Clears and sends clear message
function clearClicked() {
    clearCanvas();
    if (TogetherJS.running) {
        TogetherJS.send({
            type: "clearCanvas"
        });
    }
}

// Clears the canvas
function clearCanvas() {
    context.clearRect(0,0 , canvas.width, canvas.height);
}

// Draws the lines
function draw(start, end, color, size, compositeoperation) {
    context.save();
    context.strokeStyle = color;
    context.globalCompositeOperation = compositeoperation;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.closePath();
    context.stroke();
    context.restore();
}

function saveDrawings() {
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    window.location.href=image;
}

function onLoadClick() {
    $("#input").click();
}

var input = document.getElementById('input');
input.addEventListener('change', handleFiles);

function handleFiles(e) {
    var img = new Image;
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = function() {
        if ((img.width != bgCanvas.width) || (img.height != bgCanvas.height)) {
            bgCanvas.width = img.width;
            bgCanvas.height = img.height;
            canvas.width = img.width;
            canvas.height = img.height;
        }
        context.drawImage(img, 0,0);
        img = canvas.toDataURL("image/png");
        if (TogetherJS.running) {
            TogetherJS.send({
                type: "load",
                loadobject: img
            });
        }
    }
}

TogetherJS.hub.on("clearCanvas", function (msg) {
    if (!msg.sameUrl) {
        return;
    }
    clearCanvas();
});

TogetherJS.hub.on("resetBackground", function (msg) {
    if (!msg.sameUrl) {
        return;
    }
    resetBackground();
});

TogetherJS.hub.on("draw", function (msg) {
    if (!msg.sameUrl) {
        return;
    }
    draw(msg.start, msg.end, msg.color, msg.size, msg.compositeoperation);
});

TogetherJS.hub.on("setBackground", function (msg) {
    if (!msg.sameUrl) {
        return;
    }
    setBackground(msg.background);
});

TogetherJS.hub.on("togetherjs.hello", function (msg) {
    if (!msg.sameUrl) {
        return;
    }
    var drawings = canvas.toDataURL("image/png");
    TogetherJS.send({
        type: "init",
        drawings: drawings,
        background: currentBackground
    });
});

TogetherJS.hub.on("init", function(msg) {
    if (!msg.sameUrl) {
        return;
    }
    initDrawings = new Image();
    initDrawings.src = msg.drawings;
    init = true;
    setBackground(msg.background);
});

TogetherJS.hub.on("load", function(msg) {
    if (!msg.sameUrl) {
        return;
    }
    var load = new Image();
    load.src = msg.loadobject;
    if ((load.width != bgCanvas.width) || (load.height != bgCanvas.height)) {
        console.log(load.width, load.height);
        bgCanvas.width = load.width;
        bgCanvas.height = load.height;
    }
    canvas.width = load.width;
    canvas.height = load.height;
    context.drawImage(load, 0,0);


});

$(document).ready(function () {

    // Hide popover
    function hidePopover(element) {
        if (element.next('div.popover:visible').length) {
            element.popover('toggle');
        }
    };

    // Initialize popovers
    $('#chooseMap').popover({
        html: true,
        placement: 'bottom',
        content: function () {
            return $('#chooseMap_content_wrapper').html();
        }
    });

    $('#chooseBrush').popover({
        html: true,
        placement: 'bottom',
        content: function () {
            return $('#chooseBrush_content_wrapper').html();
        }
    });

    // Show popovers
    $('#chooseMap').on('shown.bs.popover', function () {

        $("#gameslist").select2({
            placeholder: "Select Game"
        }).on("change", function (e) {
            var mapsList = $('#mapslist');
            mapsList.html($('#' + e.val).html());
        });


        $("#mapslist").select2({
            placeholder: "Select Map"
        }).on("change", function (e) {
            backgroundClicked(e.val);
            hidePopover($("#chooseMap"));
        });

        hidePopover($("#chooseBrush"));

        // More maps
        $('.moreMaps').click(function(){
            hidePopover($("#chooseMap"));
            $('#moreMapsModal').modal('toggle', {
              keyboard: false
            });
        });

    });

    $('#chooseBrush').on('show.bs.popover', function () {
        hidePopover($("#chooseMap"));

    });

    $('#chooseBrush').on('shown.bs.popover', function () {
        $('#brushSizeForm').append('<input type="text" class="slider" id="brushSize" style="width: 360px;" />');
        $('.slider').slider({
            min: 2,
            max: 50,
            step: 1,
            value: context.lineWidth
        }).on('slide', function (ev) {
            setSize(ev.value);
        }).on('slideStop', function (ev) {
            hidePopover($("#chooseBrush"));
            ChangeMouse();
        });

        // Button listeners

        //Color change functions
        $('.green-pick').click(function () {
            setColor('#00ff00');
            hidePopover($("#chooseBrush"));
            ChangeMouse();
        });

        //Color change functions
        $('.yellow-pick').click(function () {
            setColor('#ff0');
            hidePopover($("#chooseBrush"));
            ChangeMouse();
        });

        //Color change functions
        $('.red-pick').click(function () {
            setColor('#ff0000');
            hidePopover($("#chooseBrush"));
            ChangeMouse();
        });

        //Color change functions
        $('.blue-pick').click(function () {
            setColor('#0000ff');
            hidePopover($("#chooseBrush"));
            ChangeMouse();
        });

        //Color change functions
        $('.black-pick').click(function () {
            setColor('#000');
            hidePopover($("#chooseBrush"));
            ChangeMouse();
        });
        $('.eraser').click(function () {
            eraser();
            hidePopover($("#chooseBrush"));
            ChangeMouse();
        })
    });

    // Hide popover listeners
    $('#chooseBrush').on('hide.bs.popover', function () {
        $('.slider').remove();
    });

    // Close popovers when clicking on canvas
    $('#sketch').mousedown(function () {
        hidePopover($("#chooseMap"));
        hidePopover($("#chooseBrush"));
    });

    // Listeners
    $('.clearCanvas').click(function(){
        clearClicked();
    });
    $('.resetCanvas').click(function(){
        resetClicked();
    });

    $('.increaseBrush').click(function(){
        increaseBrush();
    });
    $('.decreaseBrush').click(function(){
        decreaseBrush();
    });

    $('.saveDrawings').click(function(){
        saveDrawings();
        $.bootstrapGrowl("Saved drawings - please select the correct map before attempting to load.", {
            type: 'success',
            width: 'auto'
        });
    })

    // Draw Mouse
        function ChangeMouse(){
            var brushSize = context.lineWidth;
            if (brushSize < 10){
                brushSize = 10;
            }

            var brushColor = context.strokeStyle;

            var eraser = false;
            if (context.globalCompositeOperation == "destination-out"){
                eraser = true;
            }

            var cursorGenerator = document.createElement("canvas");
            cursorGenerator.width = brushSize;
            cursorGenerator.height = brushSize;
            var ctx = cursorGenerator.getContext("2d");

            var centerX = cursorGenerator.width / 2;
            var centerY = cursorGenerator.height / 2;
            var radius = brushSize;

            ctx.beginPath();
            ctx.arc(centerX, centerY, (brushSize/2)-4, 0, 2 * Math.PI, false);
            if (eraser){
                 ctx.fillStyle = 'white';
                 ctx.fill()
            }

            ctx.lineWidth = 3;
            ctx.strokeStyle = brushColor;
            ctx.stroke();

            $('#sketch').css( "cursor", "url(" + cursorGenerator.toDataURL("image/png") + ") " + brushSize/2 + " " + brushSize/2 + ",crosshair");


        };
    // Init mouse
    ChangeMouse();

});
*/