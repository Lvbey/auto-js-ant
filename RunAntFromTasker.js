//从tasker指定的程序会是Tmp.js，目录在/storage/emulated/0/脚本
//从tasker指定的程序会是Tmp.js，目录在/storage/emulated/0/脚本
//从tasker指定的程序会是Tmp.js，目录在/storage/emulated/0/脚本

var path = engines.myEngine().cwd();///storage/emulated/0/脚本
path += "/auto-js-ant-release";
console.log("在"+path+"下，运行RunAnt.js");
engines.execScriptFile(path+"/RunAnt.js");

exit();