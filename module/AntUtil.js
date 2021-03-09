var AntConfig = require("./AntConfig.js");

var AntUtil = {};
AntUtil.owndate = {};
AntUtil.storage = {}

AntUtil.owndate.getNowMin = function(){
    return new Date().getMinutes();
}
AntUtil.owndate.getNowHour = function(){
    return new Date().getHours();
}


//0是周日，剩下1-6匹配
AntUtil.owndate.getNowWeekNum = function(){
    return new Date().getDay();
}
//判断当前时间是不是周末
AntUtil.owndate.isNowWeekend = function (){
    var weekDay = this.getNowWeekNum();
    if(weekDay== 6 || weekDay == 0){
        return true;
    }
    return false;
}
AntUtil.owndate.yestoday = function(day){
    return new Date(day.getTime()-24*60*60*1000);
}
AntUtil.owndate.getDateStr = function(day){
    var day2 = new Date();
    day2.setTime(day.getTime());
    var s2 = day2.getFullYear()+"-" + (day2.getMonth()+1) + "-" + day2.getDate();
    return s2;
}

AntUtil.storage.removeYestoday = function(){
    var storage = this.getStorage();
    var yestodayStr = AntUtil.owndate.getDateStr(AntUtil.owndate.yestoday(new Date()));
    console.log("移除"+storage+"的"+yestodayStr);
    storage.remove(yestodayStr);
}
AntUtil.storage.removetoday = function(){
    var storage = this.getStorage();
    var todayStr = AntUtil.owndate.getDateStr(new Date());
    console.log("移除"+storage+"的"+todayStr);
    storage.remove(todayStr);
}

AntUtil.storage.setRunCountToday = function(runCount){
    var storage = this.getStorage();
    storage.put(AntUtil.owndate.getDateStr(new Date()), runCount);
}
AntUtil.storage.getRunCountToday = function () {
    var storage = this.getStorage();
    var runCount = storage.get(AntUtil.owndate.getDateStr(new Date()), 0);
    if(runCount == 0){
        this.removeYestoday();
    }
    return runCount;
}




AntUtil.storage.getStorage = function () {
    return storages.create(AntConfig.StorageName);
}
AntUtil.storage.getPassByStorage = function () {
    var storage = this.getStorage();
    var pass = storage.get(AntConfig.StorageLoginPassName, false);
    if (!pass) {
        this.tLog("需要设置登录密码");
        return null;
    } else {
        console.log("从本地获取到登录密码");
        return pass;
    }
}
AntUtil.storage.setPassByStorage = function (pass) {
    var storage = this.getStorage();
    storage.put(AntConfig.StorageLoginPassName, pass);
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
    if (res != null && res.statusCode >= 200 && res.statusCode < 300) {

        var remoteVersion = res.body.string();

        log("code = " + res.statusCode + ", body = " + remoteVersion);

        return remoteVersion;
    } else {
        toast("版本信息获取失败或者无法连接网络");
        exit();
        return false;
    }
}


AntUtil.OverrideFiles = function (srcDir, DesDir) {
    console.log(files.remove(srcDir + "/RunAnt.js"));//不覆盖这个文件

    console.log(files.copy(srcDir, DesDir));

    // var arr = files.listDir(srcDir);
    // console.log(arr);

}

AntUtil.checkUpdate = function (normalCallback) {
    var _this = this;


    _this.tLog("准备检查更新");
    

    // var remoteVersion = AntUtil._getRemoteVersion();
    // console.log("本地版本：" + AntConfig.VersionNow + "，远程版本："+remoteVersion);
    // if(AntConfig.VersionNow != remoteVersion){
    // console.log("需要更新");

    var downloadUrl = AntConfig.DownloadUrl;

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


    var retryTimes = 3;
    for(var i = 0; i < retryTimes; i++){
        var r = http.get("www.baidu.com");
        if (r != null && r.statusCode + "" == "200") {
            console.log("网络通畅");
            retryTimes = 0;
            break;
        } else {
            _this.tLog("无法连接网络，即将重试");
            if(i == retryTimes-1){
                _this.tLog("已重试"+(i+1)+"次，无法连接网络，即将退出程序。");
                exit();
            }
        }
    }


    var appRetryTimes = 3;
    for(var i = 0; i < appRetryTimes; i++){
        //到这里应该有网络，但是更新可能会失败，失败的话，执行本地程序

        var res = http.get(downloadUrl, {
            headers: {
                'Accept-Language': 'zh-cn,zh;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'Mozilla/5.0(Macintosh;IntelMacOSX10_7_0)AppleWebKit/535.11(KHTML,likeGecko)Chrome/17.0.963.56Safari/535.11'
            }
        });

        if(res == null)  {
            _this.tLog("目标网站可能无法访问，即将重试");

            if(i == appRetryTimes-1){
                _this.tLog("已重试"+(i+1)+"次，无法更新程序，使用本地文件执行。");
                engines.execScriptFile(AntConfig.WorkDirPath + "/RunAnt.js");
                exit();
            }

        }else{
            appRetryTimes = 0;
        }
    }




    if (res.statusCode >= 200 && res.statusCode < 300) {
        
        var bytes = res.body.bytes();
        // _this.tLog("相应内容类型："+res.body.contentType +",bytes长度:"+bytes.length);

        var file = AntConfig.WorkDirPath + ".zip";
        // files.create();
        files.writeBytes(file, bytes);

        //目前github无法获取单个文件，所以版本号是需要下载zip包解压和本地文件判读那
        var tmp = AntConfig.WorkDirPath + "/tmp";
        _this.Unzip(file, tmp, false);//解压到临时文件夹，判断版本号

        var localVersion  = files.read(AntConfig.WorkDirPath+"/version");
        var remoteVersion = files.read(tmp+"/auto-js-ant-release/version");
        console.log("本地版本：" + localVersion + "，远程版本：" + remoteVersion);

        if (localVersion != remoteVersion) {
            setTimeout(function () {
                console.log("更新完成，延迟执行RunAnt.js...");
            }, 5000);
            
            _this.Unzip(file, AntConfig.WorkDirPath + "/../", false);//解压即覆盖
            _this.tLog("更新到最新版本完成");
            engines.execScriptFile(AntConfig.WorkDirPath + "/RunAnt.js");
            exit();
            
        } else {
             console.log("已是最新版本了");
            if (normalCallback) {
                normalCallback();
            }
        }

    } else if (res != null) {
        _this.tLog(res);
    }
}


/* 
AntUtil.checkNetwork = function() {

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
    var r = http.get("www.baidu.com");
    if (r != null && r.statusCode + "" == "200") {
        console.log("网络通畅");
        return true;
    } else {
        console.log("网络不通");
        return false;
    }
}
 */

AntUtil.Unzip = function (input_path, output_path, within_folder, dialog) {
    // delete global._$_dialog_streaming_intrp_sgn;

    let {
        File,
        FileOutputStream: FOS,
        BufferedInputStream: BIS,
        BufferedOutputStream: BOS,
    } = java.io;

    let ZF = java.util.zip.ZipFile;

    let _t_file_sz = 0;
    let _uncompr_sz = 0;
    let _sep = File.separator;

    let _i_path = files.path(input_path);
    let _o_path = output_path;

    try {
        if (!files.exists(_i_path)) {
            _i_path += ".zip";
            if (!files.exists(_i_path)) {
                throw Error("解压缩源不存在");
            }
        }
        let _i_file = new File(_i_path);
        _t_file_sz += _i_file.length();

        _o_path = _o_path
            ? files.path(_o_path)
            : _i_path.slice(0, _i_path.lastIndexOf(_sep));

        if (within_folder) {
            let _nm = _i_file.getName();
            _o_path += _sep + _nm.slice(0, _nm.lastIndexOf("."));
        }

        files.createWithDirs(_o_path + _sep);

        let _read_bytes;
        let _buf_len = 1024;
        let _buf_bytes = util.java.array("byte", _buf_len);
        let _zif = new ZF(_i_file); // zip input file
        let _ze = _zif.entries(); // zip entries

        while (_ze.hasMoreElements()) {
            let _entry = _ze.nextElement();
            let _entry_nm = _entry.getName();
            if (!global["_$_project_backup_path"]) {
                let _idx = _entry_nm.indexOf(_sep);
                let _path = ~_idx ? _entry_nm.slice(0, _idx) : _entry_nm;
                global["_$_project_backup_path"] = _o_path + _sep + _path + _sep;
            }
            let _entry_path = files.path(_o_path + _sep + _entry_nm);
            files.createWithDirs(_entry_path);
            let _entry_file = new File(_entry_path);
            if (_entry_file.isDirectory()) {
                continue;
            }

            let _fos, _bos, _bis;

            try {
                _fos = new FOS(_entry_file);
                _bos = new BOS(_fos);
                _bis = new BIS(_zif.getInputStream(_entry));
                while (~(_read_bytes = _bis.read(_buf_bytes, 0, _buf_len))) {
                    if (global._$_dialog_streaming_intrp_sgn) {
                        global._$_dialog_streaming_intrp_sgn = false;
                        throw Error("用户终止");
                    }
                    _bos.write(_buf_bytes, 0, _read_bytes);
                }
                if (dialog) {
                    _uncompr_sz += _entry_file.length();
                    dialog.setProgressNum(_uncompr_sz / _t_file_sz * 100);
                }
            } catch (e) {
                throw e;
            } finally {
                _bos.flush();
                _bos.close();
                _bis.close();
                _fos.close();
            }
        }

        return true;
    } catch (e) {
        if (!dialog) {
            throw e;
        }
        if (typeof dialogsx === "object") {
            dialogsx.alertContent(dialog, "解压失败:\n" + e, "append");
        } else {
            alert("解压失败:\n" + e);
        }
    }
}


module.exports = AntUtil;