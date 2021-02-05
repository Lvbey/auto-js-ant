var AntUtil = require("./module/AntUtil.js");


auto();
requestScreenCapture();


//每次运行前，都要先停止其他正在运行这个脚本的引擎
var stopOthers = function (myScriptEngin) {
    var allengines = engines.all();
    for (var i = 0; i < allengines.length; i++) {
        var one = allengines[i];

        if (one.cwd() == myScriptEngin.cwd() && one != myScriptEngin) {
            console.log("force stop " + one);
            one.forceStop();
        } else {
            console.log("now run " + one);
        }
    }
}
try {
    stopOthers(engines.myEngine());
} catch (error) {
    console.error(error);
}



var aliPackagename = "com.eg.android.AlipayGphone";
var ra = new RootAutomator();
var nomoreEngCount = 0;
var maxWidth = device.width;
var maxHeight = device.height;

var ballAvailableRect = [0, maxHeight * availableMinYR, maxWidth - 150];


// var availableMinYR = 0.21;//能量球纵坐标最小比例 
// var availableMaxYR = 0.43;//能量球纵坐标最大比例

var availableMinYR = 0.25625;//能量球纵坐标最小比例 
var availableMaxYR = 0.40625;//能量球纵坐标最大比例 

var engBallDiameter = 60;//假定能量球的直径是60

var availableXStart = 50;
var availableXEnd = maxWidth - 120;
var availableYStart = maxHeight * availableMinYR; //328
var availableYEnd = maxHeight * availableMaxYR;//520
var availableWidth = availableXEnd - availableXStart;
var availableHeight = availableYEnd - availableYStart;

var useEngDoubleCard = true;
var useEngDoubleCardSchedule = [6,0];

var engBallDoubleClick = false;


var watering_list = [];

var eng_btn_flag = "收集能量";
var friend_name_flag = "蚂蚁森林";
var ta_flag = "你收取TA";

//"成就"是不论自己的还是好友的都会显示
var excludeBtns = ["看林区", "成就", "送道具", "提醒", "弹幕", "浇水", "红包", "攻略", "任务", "背包"]

var thisTimeTotalEng = 0;
var thisWeekTotalEng = 0;

var myOwnEngNum = 0;

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
Pos.prototype = {
    //重写toString方法
    toString: function () {
        return "Pos(" + this.x + "," + this.y + ")";
    }
}

var reLoginHeadImgPos= new Pos(360, 550);

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
    var beginms = new Date().getTime();
    ra.touchMove(pos.x, pos.y, 1)
    ra.tap(pos.x + randomTo(3), pos.y + randomTo(3), 9);
    ra.press(pos.x + randomTo(3), pos.y + randomTo(3), 9);
    if (sleepTime > 0) {
    } else {
        sleepTime = 0;
    }
    sleepTime = randomTo(50) + sleepTime;
    //console.log("点击:(" + pos.x + "," + pos.y + "), sleep:"+sleepTime)
    //

    //每次都要点击一下左上角，似乎是有bug
    ra.tap(0, 0, 9);
    ra.press(0, 0, 9);

    sleep(sleepTime);
    //click(pos.x,pos.y);//这个需要Android7+
    //console.log("click函数完成，参数:"+pos+",sleepTime:"+sleepTime+"，总耗时:"+(new Date().getTime()-beginms)/1000+"秒");


}
function clickPosR(posr, sleepTime) {
    clickPos(calcPosByRate(posr), sleepTime)
}



var tLog = AntUtil.tLog;



/**
 * 等待加载收集能量页面,采用未找到指定组件阻塞的方式,等待页面加载完成
 */
function waitPage(uiSelectorOnNextPage) {
    uiSelectorOnNextPage.waitFor();
    sleep(500 + randomTo(100));//容错
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
        var object = fnTxt.find();
        var wholeText = "";
        for (var index = 0; index < object.length; index++) {
            if (object[index].className() == "android.widget.TextView") {
                wholeText = object[index].text().replace(friend_name_flag, "").trim();
                if (wholeText.length == 0) {
                    return "自己的";
                } else {
                    return wholeText;
                }
            }
        }
        //不能用forEach 返回 返回值，forEach里面的return 有 continue 的功能：https://blog.csdn.net/w390058785/article/details/79916266
        // object.forEach(function(currentValue, index) {
        //     //log(currentValue.text(),index,object[index],object[index].className())
        //     if(object[index].className() == "android.widget.TextView"){
        //         wholeText = currentValue.text().replace(friend_name_flag, "").trim();
        //         console.log(wholeText);
        //         if (wholeText.length == 0) {
        //             return "自己的";
        //         } else {
        //             return wholeText;
        //         }
        //     }
        // });
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

function btnInAvailableRect(posb) {
    //判断纵坐标是否在有效范围内
    if (posb.centerY() < maxHeight * availableMinYR) {
        console.log("坐标范围是" + posb + "，中心y坐标[" + posb.centerY() + "]小于" + (maxHeight * availableMinYR) + "，放弃点击");
        return false;
    }
    else if (posb.centerY() > maxHeight * availableMaxYR) {
        console.log("坐标范围是" + posb + "，中心y坐标[" + posb.centerY() + "]大于" + (maxHeight * availableMaxYR) + "，放弃点击");
        return false;
    } else {
        return true;
    }

}
function getMyOwnEngNumNow() {
    var objects = textContains("种树").findOne().parent().children();
    for (var i = 0; i < objects.length; i++) {
        //log(objects[i]);
        if (objects[i].className() == "android.view.View") {//克数的父级
            var subs = objects[i].children();
            for (var j = 0; j < subs.length; j++) {
                //log(subs[j]);
                if (subs[j].text().length > 0) {
                    var text = (subs[j].text() + "").replace(/\D/g, "");
                    var num = text == "" ? 0 : parseInt(text);
                    console.log("当前自己的能量是:" + num + "g");
                    return num;
                }
            }
        }
    }
    return 0;
}

var sameoneXdiff = engBallDiameter / 2;
var sameoneYdiff = 10;

function clickAllEngBts(self) {
    device.wakeUp();
    var findDesBtn = "";
    var taView = null;
    if (!self) {
        //console.log("好友的蚂蚁森林");
        findDesBtn = "你收取TA";
        taView = textContains(findDesBtn).findOne(9000);//等待页面加载5秒，看看是否有 组件
    } else {
        //console.log("自己的蚂蚁森林");
        findDesBtn = "排行榜";
        taView = text(findDesBtn).findOne(9000);
    }
    //console.log("等待页面加载...");

    if (taView != null) {
        var clickCount = 0;
        var friend_name = friendName();

        var img = captureScreen();

        //判断有无能量保护罩
        var color = images.pixel(img, maxWidth / 2, 255);
        // //显示该颜色值
        if ((colors.toString(color)) == "#ffb4ff70") {//#ffb4ff70
            tLog("好友开启了能量保护罩...");
            return;
        }

        // images.clip(img, x, y, w, h);//从图片img的位置(x, y)处剪切大小为w * h的区域
        var clipedImage = images.clip(img, availableXStart, availableYStart, availableWidth, availableHeight);
        var clipedImageWidth = clipedImage.getWidth();

        var blurImage = images.blur(clipedImage, [3, 3]);//圆润处理

        var engImage = images.interval(blurImage, "#c1fe00", 30);//只留下能量球
        var yelImage = images.interval(blurImage, "#fcdf69", 10);//只留下浇水球

        /* 
                console.log("保存中...");
        
                var engImagePath = "/storage/emulated/0/autojs/img/engImage.jpg";
                images.save(engImage, engImagePath, format = "jpg");
        
                var yelImagePath = "/storage/emulated/0/autojs/img/yelImage.jpg";
                images.save(yelImage, yelImagePath, format = "jpg");
         */

        //好友浇水
        /*   var help = images.findColorInRegion(img, "#a8811f", 150,250,150,200,40);
          if (help) {
              //log("找到帮ta收取位置:" + help);
              clickPos(help, 700);
          } */


        var accx = 0;
        var xstep = engBallDiameter;
        var ballsPos = [];
        var lastPos = new Pos(0, 0);
        var lastPos2 = new Pos(0, 0);
        while (accx < clipedImageWidth) {

            //避免最后的一块识别不到
            if (clipedImageWidth < (accx + xstep)) {
                xstep = clipedImageWidth - accx;
            }

            //普通能量球
            var point = images.findColorInRegion(engImage, "#ffffff", accx, 0, (xstep), clipedImage.getHeight(), 0);
            if (point) {
                var realPos = new Pos(point.x + availableXStart, point.y + availableYStart);
                if ((realPos.x - lastPos.x) <= sameoneXdiff && (realPos.y - lastPos.y) <= sameoneYdiff) {
                    // console.log(lastPos+" , "+realPos+" 两点似乎是同一个能量球");
                } else {
                    ballsPos.push(realPos);
                }
                lastPos = realPos;
            }

            //浇水能量球
            var point2 = images.findColorInRegion(yelImage, "#ffffff", accx, 0, xstep, clipedImage.getHeight(), 0);
            if (point2) {
                var realPos = new Pos(point2.x + availableXStart, point2.y + availableYStart);
                if ((realPos.x - lastPos2.x) <= sameoneXdiff && (realPos.y - lastPos2.y) <= sameoneYdiff) {
                    // console.log(lastPos2+" , "+realPos+" 两点似乎是同一个能量球");
                } else {
                    ballsPos.push(realPos);
                }
                lastPos2 = realPos;
            }

            accx += xstep;
        }
        console.log("点击" + friend_name + "森林" + ballsPos.length + "次");
        ballsPos.forEach(function (pos) {
            clickPos(pos, 1000);
            clickPos(pos, 200);
            if(engBallDoubleClick){//双击
                clickPos(pos, 1000);
                clickPos(pos, 200);
            }
            
        });

        if (watering_list.indexOf(friend_name) >= 0 && !self) {
            // #1695e8 是 浇水按钮的颜色
            var watering = images.findColorInRegion(img, "#1695e8", 470, 1000, 50, 50, 0);
            //给好友浇水
            for (var times = 0; times < 1; times++) {
                console.log(friend_name + "在浇水列表里...");
                if (watering) {
                    log("找到浇水按钮位置:" + watering);
                    clickPos(watering, 600);
                    sleep(2000);
                    var btn66 = text("66克").findOne(5000);
                    if (btn66 != null) {
                        btn66.click();
                        var btnsend = text("浇水送祝福").findOne(5000);
                        if (btnsend != null) {
                            btnsend.click();
                            sleep(5000);
                            text("你收取TA").findOne(5000);//等待回调页面完成
                        }
                    }
                }
            }
        }
        //回收图片
        img.recycle();
        blurImage.recycle();
        engImage.recycle();
        yelImage.recycle();
    } else {
        console.log("已等待页面加载9秒，没有找到" + findDesBtn + "按钮...");
        if (!self && desc("返回").exists()) {
            tLog("没有能量了，即将退出...");
            desc("返回").findOne().click();//返回自己的森林
            waitPage(text("排行榜"));//等待加载个人界面
            console.log("本次收取能量：" + (getMyOwnEngNumNow() - myOwnEngNum) + "g");
            sleep(1000);
            desc("关闭").findOne().click();//返回支付宝首页
        }
        continueFlag = false;
    }
}

function checkPass(){
    if(AntUtil.storage.getPassByStorage() == null){
        rawInput("请输入您的支付宝登录密码(存储于本地，不会上传)", "", pass => {
            AntUtil.storage.setPassByStorage(pass);
       });
    }
}

var needrelogin = true;//默认是需要登录的
function checkLogin() {

    console.log("开启重登陆检测");
    launchApp("支付宝");

    tLog("等待支付宝启动");
    sleep(2000);

    var anacc = textContains("点击下方头像登录").findOne(15000);
    if (anacc != null) {
        clickPos(reLoginHeadImgPos, 250);
        tLog("点击头像框");
        sleep(2000);
    } else {
        //账号在其他设备登录
        //判断账号在其他设备登录
        var loginErrmsg = text("账号在其他设备登录").findOne(5000);
        if (loginErrmsg != null) {
            text("好的").findOne().click();
        }else{
            //直接在登录界面
        }
    }
    


    //如果需要登录，必须保证此时已经抵达输入密码的界面
    if (needrelogin) {
        console.log("需要重新登录");
        sleep(2000);
        var acct = textContains("账号").findOne(10000);
        var pass = textContains("密码").findOne(10000);
        if(pass != null && acct!=null){
            tLog("准备输入密码");
            var rect = pass.bounds();
            clickPos(new Pos(rect.centerX()+rect.width()*5,rect.centerY()));
        }

        Text(AntUtil.storage.getPassByStorage());
        sleep(3000);
        text("登录").findOne().click();
        sleep(2000);

        if(text("开通指纹登录").exists()){
            text("关闭").findOne().click();
        }

        var homeBtn = text("首页").findOne(5000);//等待回调页面完成
        if (homeBtn != null) {
            tLog("重新登录完成");
        }

    }
    

}

/**
 * 从支付宝主页进入蚂蚁森林我的主页
 */
function enterMyMainPage() {


    //判断是不是在其他页面
    var homeBtn = text("首页").findOne(5000);//等待回调页面完成
    if (homeBtn != null) {
        //在首页
        click("首页");
        console.log("在首页...");
    } else {
        //先关闭其他页面，再回到首页点击
        var closePageBtn = desc("关闭").findOne(5000);//等待回调页面完成
        if (closePageBtn != null) {
            console.log("不在首页，点击关闭按钮...");
            closePageBtn.click();
            sleep(2000);
        }

    }

    waitPage(text("蚂蚁森林"));//等待支付宝加载完毕

    click("蚂蚁森林");
    tLog("正在进入蚂蚁森林...");

    sleep(1000);
    waitPage(text("排行榜"));//等待加载个人界面
    myOwnEngNum = getMyOwnEngNumNow();
    clickAllEngBts(true);

}

function f_useEngDoubleCard(){
    var runCount = AntUtil.storage.getRunCountToday();
    console.log("当前第"+(runCount+1)+"次运行程序");
    if(runCount>0){
        console.log("能量双击卡只能在每天第一次运行时才能使用");
        engBallDoubleClick = false;
        return ;
    }
    AntUtil.storage.setRunCountToday(runCount+1);


    if(!useEngDoubleCard){
        console.log("没有开启使用能量双击卡开关");
        return ;
    }

    var nowWeekNum = AntUtil.owndate.getNowWeekNum();
    if(useEngDoubleCardSchedule.indexOf(nowWeekNum) < 0){
        console.log("当前星期序号："+nowWeekNum+"，不在使用能量双击卡执行计划范围["+useEngDoubleCardSchedule+"]内");
        return;
    }

    sleep(1000);
    clickPos(new Pos(152,1041)); //背包
    sleep(2000);
    var engCard = text("能量双击卡").findOne();
    if(engCard){
        engCard.parent().children().forEach(function (child) {
            var textstr = child.text();
            
            if (typeof (textstr) === "string" && textstr.indexOf("使用") >= 0) {
                console.log(child.click());
                //立即使用
                sleep(1000);
                if(text("立即使用").exists()){
                    console.log("使用了能量双击卡");
                    text("立即使用").findOne().click();
                    engBallDoubleClick = true;
                }
            }
        });
    }else{
        console.log("没有能量双击卡");
        engBallDoubleClick = false;
    }
}

function getFriendsEng() {

    f_useEngDoubleCard();//判断是否使用能量双击卡


    continueFlag = true;

    while (continueFlag) {
        //点击逛一逛
        clickPosR(explorePosR, 500);//点击一次之后紧接着再点一次,防止界面有文字提示
        clickPosR(explorePosR, 3000);

        waitPage(textEndsWith("蚂蚁森林"));//这里要注意，要保证最后一个没有能量的页面能够被加载出来
        clickAllEngBts(false);
    }
}

function randomTo(integer) {
    return parseInt((integer * random()).toFixed(0));
}


function closeApp(packagename) {
    return 0;
    var sh = new Shell(true);
    //注册一个对象运用shell命令，true(真) 以root权限运行代码，默认为falae假
    sh.exec("am force-stop" + " " + packagename);//执行代码运行中属于异步运行
    sh.exec("am kill" + " " + packagename);//执行代码运行中属于异步运行

    toast("完全关闭" + packagename);
    //上面值com.android.browser是浏览器的包名。自行修改成想停止软件的包名
    sleep(5000);
    //给点延迟让前面的运行命令，一会软件就会关闭
    sh.exit();
    sleep(5000);
    //退出Shell命令，正在执行的命令会被强制退出。所以上面加延迟
}

function unlock() {
    if (!device.isScreenOn()) {
        device.wakeUp();
        sleep(2000);
        ra.swipe(maxWidth / 2, maxHeight - 50, maxWidth / 2, 50, 500);
        sleep(1000);
    }
}


function main() {

    threads.start(function () {
        //在新线程执行的代码
        setTimeout(function () {
            console.log("运行30分钟了，自动退出脚本");
            exit();
        }, 30 * 60 * 1000);//exit() after 30min
    });





    unlock();
    checkPass();


    checkLogin();

    var popupMonitor = threads.start(function () {
        console.log("开启弹窗监控进程...");
        //在新线程执行的代码
        while (true) {
            var pop1 = idContains("J_pop_treedialog_close");
            if (pop1.exists()) {
                console.log("检测到有弹窗(J_pop_treedialog_close)，执行关闭操作...");
                pop1.find().click();
            }

            var object = className("android.widget.Image").find();
            for (var index = 0; index < object.length; index++) {
                if (object[index].text().indexOf("AA") > 0) {
                    var _pop = object[index];
                    var closeBtn = _pop.parent().child(1);
                    console.log("检测到有弹窗(多A)，执行关闭操作...");
                    closeBtn.click();
                }
            }
            sleep(2000);
        }
    });

    enterMyMainPage();
    getFriendsEng();


    events.on('exit', function () {
        //停止线程执行
        popupMonitor.interrupt();
        ra.exit();
        home();
        console.log("终止弹窗监控进程...退出root...返回桌面");
    })

    console.log("退出脚本");
    exit();


}

main();


// checkLogin();

