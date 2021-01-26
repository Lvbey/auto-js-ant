auto();
//每次运行前，都要先停止其他正在运行这个脚本的引擎
var stopOthers = function (myScriptEngin) {
    var allengines = engines.all();
    for (var i = 0; i < allengines.length; i++) {
        var one = allengines[i];

        if (one.cwd() == myScriptEngin.cwd() && one != myScriptEngin) {
            console.log("forceStop " + one);
            one.forceStop();
        } else {
            console.log(one + " is running..");
        }
    }
}
try {
    stopOthers(engines.myEngine());
} catch (error) {
    console.error(error);
}


var availableMinYR = 0.21;//能量球纵坐标最小比例
var availableMaxYR = 0.43;//能量球纵坐标最大比例

var watering_list = ["谢谢梅梅的"];//这里要在最后加个 的

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
Pos.prototype = {
    //重写toString方法
    toString: function () {
        return "Pos(" + this.x + "," + this.y + ")";
    }
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





function tLog(msg) {
    toast(msg);
    console.log(msg)
}


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
        var wholeText = fnTxt.findOne().text().replace(friend_name_flag, "").trim();
        if (wholeText.length == 0) {
            return "自己的"
        } else {
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


function btnInAvailableRect(posb){
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


function clickAllEngBts(self) {
    device.wakeUp();
    var findDesBtn = "";
    if (!self) {
        console.log("好友的蚂蚁森林");
        findDesBtn = "浇水";
    } else {
        console.log("自己的蚂蚁森林");
        findDesBtn = "成就";
    }
    console.log("等待页面加载...");
    var taView = textEndsWith(findDesBtn).findOne(5000);//等待页面加载5秒，看看是否有 成就 按钮
    if (taView != null) {
        var clickCount = 0;
        var friend_name = friendName();
        taView.parent().children().forEach(function (child) {
            var textstr = child.text().trim();
            var posb = child.bounds();
        
            if (typeof (textstr) === "string" && textstr.indexOf(eng_btn_flag) >= 0 && btnInAvailableRect(posb)) {
                //有可能是可以收取的能量
                clickPos(new Pos(posb.centerX(), posb.centerY()), 700);
                clickPos(new Pos(posb.centerX(), posb.centerY()), 600);
                clickCount++;

            } else if (("" + textstr).length == 0 && btnInAvailableRect(posb)) {
                //帮忙给好友收取或者是好友自己的能量球
                //console.log("点击帮TA收取或者是点击不可收取能量");
                clickPos(new Pos(posb.centerX(), posb.centerY()), 700);
                clickPos(new Pos(posb.centerX(), posb.centerY()), 600);
            } else if (textstr == "浇水" && watering_list.indexOf(friend_name) >= 0 && !self) {
                //给好友浇水
                for (var times = 0; times < 3; times++) {
                    console.log(friend_name + "在浇水列表里...");
                    clickPos(new Pos(posb.centerX(), posb.centerY()), 600);
                    sleep(2000);
                    var btn66 = text("66克").findOne(5000);
                    if (btn66 != null) {
                        btn66.click();
                        var btnsend = text("浇水送祝福").findOne(5000);
                        if (btnsend != null) {
                            btnsend.click();
                            sleep(5000);
                            text("浇水").findOne(5000);//等待回调页面完成
                        }
                    }
                }
            }
            else {
                //console.log("不点击这个按钮");
            }
        });
        console.log("在" + friend_name + "蚂蚁森林点击了有能量的能量球" + clickCount + "次");

    } else {
        console.log("已等待页面加载5秒，没有找到" + findDesBtn + "按钮...");
        if (!self && desc("返回").exists()) {
            tLog("没有能量了，即将退出...");
            desc("返回").findOne().click();//返回自己的森林
            sleep(1000);
            desc("关闭").findOne().click();//返回支付宝首页
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

    //判断是不是在其他页面
    var homeBtn = textEndsWith("首页").findOne(3000);//等待回调页面完成
    if (homeBtn != null) {
        //在首页
        console.log("在首页...");
    } else {
        //先关闭其他页面，再回到首页点击
        var closePageBtn = desc("关闭").findOne(3000);//等待回调页面完成
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
    waitPage(text("背包"));//等待加载个人界面
    //收取自己的能量
    //tLog("准备收取自己的能量...");
    clickAllEngBts(true);

}


function getFriendsEng() {
    continueFlag = true;

    while (continueFlag) {
        //点击逛一逛
        clickPosR(explorePosR, 500);//点击一次之后紧接着再点一次,防止界面有文字提示
        clickPosR(explorePosR, 3000);

        waitPage(textEndsWith("蚂蚁森林"));
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

    unlock();

    ///closeApp(aliPackagename);//每次运行前，先完全终止支付宝

    enterMyMainPage();
    getFriendsEng();

    ///closeApp(aliPackagename);

    events.on('exit', function () {
        ra.exit();
        home();
        console.log("退出root，返回桌面");
    })

    console.log("退出脚本");
    exit();

}

main();