var AntConfig = require("./AntConfig");

var AntUtil = {};


AntUtil.storage = {}
AntUtil.storage.getStorage = function (){
    return storages.create(AntConfig.StorageName);
}
AntUtil.storage.getPassByStorage = function (){
    var storage = this.getStorage();
    var pass = storage.get(AntConfig.StorageLoginPassName,false);
    if(!pass){
        this.tLog("需要设置登录密码");
        return null;
    }else{
        console.log("从本地获取到登录密码");
        return pass;
    }
}
AntUtil.storage.setPassByStorage = function (pass){
    var storage = this.getStorage();
    storage.put(AntConfig.StorageLoginPassName,pass);
    this.tLog("设置密码完成");
}

AntUtil.tLog = function (msg) {
    toast(msg);
    console.log(msg)
}

AntUtil._getRemoteVersion = function () {
    (function () {
        let request = http.request;
        // 覆盖http关键函数request，其他http返回最终会调用这个函数
        http.request = function () {
            try {
                // 捕捉所有异常
                return request.apply(http, arguments);
            } catch (e) {
                // 出现异常返回null
                console.error(e);
                return null;
            }
        }
    })();
    //设置超时为10秒
    http.__okhttp__.setTimeout(10000);

    /* 
    var r = http.get("www.baidu.com");
    if (r != null && r.statusCode + "" == "200") {
        console.log("网络通畅");
        return true;
    } else {
        console.log("网络不通");
        return false;
    } */




    var res = http.get(AntConfig.VersionUrl);
    if (res!=null && res.statusCode >= 200 && res.statusCode < 300) {
        
        var remoteVersion = res.body.string();

        log("code = " + res.statusCode+", body = "+ remoteVersion);

        return remoteVersion;
    } else {
        toast("版本信息获取失败或者无法连接网络");
        exit();
        return false;
    }
}


AntUtil.checkUpdate = function(){
    var remoteVersion = AntUtil._getRemoteVersion();
    console.log("本地版本：" + AntConfig.VersionNow + "，远程版本："+remoteVersion);
    if(AntConfig.VersionNow != remoteVersion){
        console.log("需要更新");
    }else{
        toast("已经是最新版本了");
    }

}


module.exports = AntUtil;