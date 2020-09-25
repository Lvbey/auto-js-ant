
var aliPackagename = "com.eg.android.AlipayGphone";
var ra = new RootAutomator();
var nomoreEngCount = 0;
var maxWidth = device.width;
var maxHeight = device.height;

var eng_btn_flag = "收集能量";
var friend_name_flag = "蚂蚁森林";
var ta_flag = "你收取TA";

//"成就"是不论自己的还是好友的都会显示
var excludeBtns = ["看林区", "成就", "送道具", "提醒", "弹幕", "浇水", "红包", "攻略", "任务", "背包"]

var thisTimeTotalEng = 0;
var thisWeekTotalEng = 0;


var explorePosR = new PosR(0.9, 0.8);

var friendEngMap = new Array();
function getFEIndexByName(name) {
    for (i = 0; i < friendEngMap.length; i++) {
        if (friendEngMap[i].name === name) {
            return i;
        }
    }
    return -1;
}
var nomoreFriendEngMap = new Array();
function getIndexByName(name) {
    for (i = 0; i < nomoreFriendEngMap.length; i++) {
        if (nomoreFriendEngMap[i].name === name) {
            return i;
        }
    }
    return -1;
}

var continueFlag = true;

//坐标点
function Pos(x, y) {
    this.x = x;
    this.y = y;
}
//坐标点相对于屏幕的比例
function PosR(wr, hr) {
    this.wr = wr;
    this.hr = hr;
}

function FriendEng(name, qtys) {
    this.name = name;
    this.qtys = qtys;
}

function calcPosByRate(posR) {
    return new Pos(maxWidth * posR.wr, maxHeight * posR.hr);
}


function clickPos(pos, sleepTime) {
    
    ra.touchMove(pos.x, pos.y,1)
    ra.tap(pos.x+randomTo(3), pos.y+randomTo(3), 1);

    if (sleepTime > 0) {
    }else{
        sleepTime = 0;
    }
    sleepTime = randomTo(50)+sleepTime;
    //console.log("点击:(" + pos.x + "," + pos.y + "), sleep:"+sleepTime)
    sleep(sleepTime);
    //click(pos.x,pos.y);//这个需要Android7+
}
function clickPosR(posr, sleepTime) {
    clickPos(calcPosByRate(posr), sleepTime)
}





function tLog(msg) {
    toast(msg);
    console.log(msg)
}


/**
 * 等待加载收集能量页面,采用未找到指定组件阻塞的方式,等待页面加载完成
 */
function waitPage(uiSelectorOnNextPage) {
    uiSelectorOnNextPage.waitFor();
    sleep(500+randomTo(100));//容错
}




/**
 * 打印对象的所有属性
 * @param {*} obj 
 */
function printObjAttr(obj) {
    if (obj == undefined) {
        return;
    }
    var info = "";
    for (let key of Object.keys(obj)) {
        let mealName = obj[key];
        info += key + ":" + mealName + "\r\n"
    }
    console.log(info);
}



/**获取好友姓名*/
function friendName() {
    var fnTxt = textEndsWith(friend_name_flag);
    if (fnTxt.exists()) {
        var wholeText = fnTxt.findOne().text().replace(friend_name_flag, "").trim();
        if(wholeText.length == 0){
            return "自己的"
        }else{
            return wholeText;
        }
    } else {
        return "Unknow"
    }
}

/**
 * 获取本周获取好友能量的克数
 */
function taQty() {
    engQty = "";
    var taView = textEndsWith(ta_flag);
    if (taView.exists()) {
        taView.findOne().parent().children().forEach(function (child) {
            var text = child.text();
            if (typeof (text) === "string" && text.indexOf("g") > 0) {
                engQty = text;
            }
        });
    } else {
        engQty = "0g";
    }
    return parseInt(engQty.replace("g", ""));
}


function clickAllEngBts(self) {
    
    if(!self){
        console.log("好友的蚂蚁森林");
    }else{
        console.log("自己的蚂蚁森林");
    }
    
    var taView = textEndsWith("成就");
    if (taView.exists()) {
        var clickCount = 0;
        taView.findOne().parent().children().forEach(function (child) {
            var text = child.text();
            //console.log("按钮text:"+text+",长度"+(""+text).length);
            var posb = child.bounds();
            if (typeof (text) === "string" && text.indexOf(eng_btn_flag) >= 0) {
                //可以收取的能量
                clickPos(new Pos(posb.centerX(), posb.centerY()),700);
                clickPos(new Pos(posb.centerX(), posb.centerY()),600);                
                clickCount++;
            } else if (("" + text).length == 1) {
                //帮忙给好友收取或者是好友自己的能量球
                //console.log("点击帮TA收取或者是点击不可收取能量");
                clickPos(new Pos(posb.centerX(), posb.centerY()),700);
                clickPos(new Pos(posb.centerX(), posb.centerY()),600);
            } else {
                //console.log("不点击这个按钮");
            }
        });
        console.log("在"+friendName()+"蚂蚁森林有效点击了"+clickCount+"次");

    } else {
        if(!self && desc("返回").exists()){
            tLog("没有能量了，即将退出...");
            var posb = desc("返回").findOne().bounds();
            clickPos(new Pos(posb.centerX(), posb.centerY()),500);
        }
        continueFlag = false;
    }
}



/**
 * 从支付宝主页进入蚂蚁森林我的主页
 */
function enterMyMainPage() {
    launchApp("支付宝");

    tLog("等待支付宝启动");
    sleep(2000);
    waitPage(text("蚂蚁森林"));//等待支付宝加载完毕

    click("蚂蚁森林");
    tLog("正在进入蚂蚁森林...");
    sleep(2000);
    waitPage(text("背包"));//等待加载个人界面
    //收取自己的能量
    //tLog("准备收取自己的能量...");
    clickAllEngBts(true);

}


function getFriendsEng() {
    continueFlag = true;

    while (continueFlag) {
        //点击逛一逛
        clickPosR(explorePosR,500);//点击一次之后紧接着再点一次,防止界面有文字提示
        clickPosR(explorePosR,3000);
        clickPosR(new PosR(0,1),200);//好像有个bug，点击的时候会停留在上一次点击的位置，这里点击一下左下角
        
        waitPage(textEndsWith("蚂蚁森林"));
        clickAllEngBts(false);
    }
}

function randomTo(integer) {
    return parseInt((integer*random()).toFixed(0));
}


function closeApp(packagename) {
    var sh = new Shell(true);
    //注册一个对象运用shell命令，true(真) 以root权限运行代码，默认为falae假
    sh.exec("am force-stop" + " " + packagename);//执行代码运行中属于异步运行
    sh.exec("am kill" + " " + packagename);//执行代码运行中属于异步运行
    
    toast("完全关闭"+packagename);
    //上面值com.android.browser是浏览器的包名。自行修改成想停止软件的包名
    sleep(5000);
    //给点延迟让前面的运行命令，一会软件就会关闭
    sh.exit();
    sleep(5000);
    //退出Shell命令，正在执行的命令会被强制退出。所以上面加延迟

}

function unlock(){
    if (!device.isScreenOn()) {
        device.wakeUp();
        sleep(2000);
        ra.swipe(maxWidth / 2, maxHeight - 300, maxWidth / 2, 50, 500);
        sleep(1000);
    }
}


function main() {

    unlock();
    
    //closeApp(aliPackagename);//每次运行前，先完全终止支付宝

    enterMyMainPage();
    getFriendsEng();

    closeApp(aliPackagename);

    events.on('exit',function(){
        ra.exit();
        console.log("退出root");
    })

    console.log("退出脚本");
    exit();

}




main();