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

var brushSize = 1;
var brushColor = "rgb(0,0,0)"
var lastMouse = {
    x: 0,
    y: 0
};

function draw(coords, color, size) {
    return new fabric.Line(coords, {
        fill: color,
        stroke: color,
        strokeWidth: size,
        selectable: false
    });
}

var rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: 'red',
    width: 40,
    height: 40
});

var line = new fabric.Line([200, 200, 201, 202], {
    strokeWidth: 15,
    stroke: 'red'
});


canvas.on('mouse:down', function(e) {
    lastMouse = canvas.getPointer(e.e);
    canvas.on('mouse:move', move);
});

canvas.on('mouse:up', function(e) {
    canvas.off('mouse:move');
});

function move(e) {
    mouse = canvas.getPointer(e.e);
    console.log(mouse);
    if ((Math.abs(mouse.x-lastMouse.x) > 1) || (Math.abs(mouse.y-lastMouse.y) > 1)) {
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
}
canvas.add(line);
//canvas.add(rect);

TogetherJS.hub.on("draw", function (msg) {
    if (!msg.sameUrl) {
        return;
    }
    console.log("received draw");
    canvas.add(draw(msg.coords, msg.color, msg.size));
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