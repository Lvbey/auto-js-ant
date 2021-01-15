debugger

console.log(images.findCircles.toSting());

var img = images.read("/storage/emulated/0/autojs/src.jpg");

var grayx = images.grayscale(img);

/*
console.log(
    images.findCircles(grayx, {
            dp: 1,
            minDist: 5,
            minRadius: 39,
            maxRadius: 70,
            param1: undefined || 15,
            param2: undefined || 15,
            region: [ 72, 192,576, 384 ],
        })
);
*/
// 14:45:59.211/D: [ 72, 192, 648, 576 ]
// 14:45:59.215/D: [ 576, 384 ]