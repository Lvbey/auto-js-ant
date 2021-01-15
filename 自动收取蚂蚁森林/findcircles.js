debugger

var img = images.read("/storage/emulated/0/autojs/src.jpg");

var grayx = images.grayscale(img);

var medianBlur = images.medianBlur(grayx, 9)

console.log(
    images.findCircles(grayx, {
            dp: 1,
            minDist: 0.09,
            minRadius: 39,
            maxRadius: 70,
            param1: undefined || 15,
            param2: undefined || 15,
            region: [ 0,0,img.width, img.height],
        })
);




_W = 720;
_H = 1280;

var forest_balls_recog_region = [cX(0.1), cYx(0.15), cX(0.9), cYx(0.45)];

function cYx(num, base) {
    num = +num;
    base = +base;
    if (Math.abs(num) >= 1) {
        if (!base) {
            base = 720;
        } else if (base < 0) {
            if (!~base) {
                base = 720;
            } else if (base === -2) {
                base = 1080;
            } else {
                throw Error("Can not parse base param for cYx()");
            }
        } else if (base < 5) {
            throw Error("Base and num params should be both pixels for cYx()");
        }
        return Math.round(num * _W / base);
    }

    if (!base || !~base) {
        base = 16 / 9;
    } else if (base === -2) {
        base = 21 / 9;
    } else if (base < 0) {
        throw Error("Can not parse base param for cYx()");
    } else {
        base = base < 1 ? 1 / base : base;
    }
    return Math.round(num * _W * base);
}

function cX(num, base) {
    return _cTrans(1, +num, base);
}
function _cTrans(dxn, num, base) {
    let _full = ~dxn ? _W : _H;
    if (isNaN(num)) {
        throw Error("Can not parse num param for cTrans()");
    }
    if (Math.abs(num) < 1) {
        return Math.min(Math.round(num * _full), _full);
    }
    let _base = base;
    if (!base || !~base) {
        _base = ~dxn ? 720 : 1280;
    } else if (base === -2) {
        _base = ~dxn ? 1080 : 1920;
    }
    let _ct = Math.round(num * _full / _base);
    return Math.min(_ct, _full);
}

let _region = forest_balls_recog_region.map((v, i) => (
    i % 2 ? v < 1 ? cY(v) : v : v < 1 ? cX(v) : v
));

let [_l, _t, _r, _b] = _region;
console.log(_region);
let [_w, _h] = [_r - _l, _b - _t];
console.log([_w, _h]);
function _getBalls(img, par1, par2) {
    return !img ? [] : images
        .findCircles(img, {
            dp: 1,
            minDist: 0.09,
            minRadius: cX(0.054),
            maxRadius: cX(0.078),
            param1: par1 || 15,
            param2: par2 || 15,
            region: [_l, _t, _w, _h],
        })
        // .map((o) => {
        //     // o.x and o.y are relative,
        //     // yet x and y are absolute
        //     let _x = Number(o.x + _l);
        //     let _y = Number(o.y + _t);
        //     let _r = Number(o.radius.toFixed(2));
        //     let _d = _r * 2;
        //     let _clip = images.clip(capt, _x - _r, _y - _r, _d, _d);
        //     let _mean = _this.getMean(_clip);
        //     _clip.recycle();
        //     _clip = null;
        //     return {x: _x, y: _y, r: _r, mean: _mean};
        // })
        // .filter(o => (
        //     o.x - o.r >= _l &&
        //     o.x + o.r <= _r &&
        //     o.y - o.r >= _t &&
        //     o.y + o.r <= _b &&
        //     // excluding homepage cloud(s)
        //     o.mean.std > 20
        // ))
        // .sort(_sortX);
}

function _sortX(a, b) {
    return a.x === b.x ? 0 : a.x > b.x ? 1 : -1;
}



var img = images.read("/storage/emulated/0/autojs/src.jpg");

var gray = images.grayscale(img);



images.save(gray, "/storage/emulated/0/autojs/img/gray.jpg", format = "jpg");


var ada = images.adaptiveThreshold(
    gray, 255, "GAUSSIAN_C", "BINARY_INV", 9, 6
);


images.save(ada, "/storage/emulated/0/autojs/img/ada.jpg", format = "jpg");


var medianBlur = images.medianBlur(gray, 9)
images.save(medianBlur, "/storage/emulated/0/autojs/img/medianBlur.jpg", format = "jpg");


var blur = images.blur(gray, 9, [-1, -1], "REPLICATE")
images.save(ada, "/storage/emulated/0/autojs/img/blur.jpg", format = "jpg");

// "/storage/emulated/0/autojs/img/grayscale.jpg"


var balls = []
    .concat(_getBalls(gray))
    .concat({ x: 0, y: 0, radius: 0 })
    .concat(_getBalls(ada)).concat({ x: 0, y: 0, radius: 0 })
    .concat(_getBalls(medianBlur)).concat({ x: 0, y: 0, radius: 0 })
    .concat(_getBalls(blur)).concat({ x: 0, y: 0, radius: 0 })
    //.concat(_getBalls(_blt_fltr))
    //.filter(_filterWball)
    // .sort(_sortX);

console.log(balls);




console.log(


    "minRadius:"+ cX(0.054)+
    "maxRadius:"+ cX(0.078)
)