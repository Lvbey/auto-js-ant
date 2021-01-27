
//这个文件要和 Ant.js 放在同一个文件夹，不然会出现execScriptFile无法require的问题

var AntConfig = require("./module/AntConfig.js");
var AntUtil = require("./module/AntUtil.js");


// AntUtil.OverrideFiles(AntConfig.WorkDirPath+"/release/auto-js-ant-release",AntConfig.WorkDirPath);

AntUtil.checkUpdate(
    function () {
        setTimeout(function () {
            console.log("更新完成，延迟执行RunAnt.js...");
            engines.execScriptFile("./RunAnt.js");
        }, 5000);
    },
    function () {
        console.log("无需更新时，正常执行");
        engines.execScriptFile("./" + AntConfig.ExescriptFileName);
    }

);





// engines.execScriptFile("./"+AntConfig.ExescriptFileName);

/*
var myEngine = engines.myEngine();
var path = myEngine.cwd();
//console.log(myEngine);
AntConfig.WorkDirPath = path;
console.log(path);
engines.execScriptFile(path+"/"+AntConfig.ExescriptFileName);

 */