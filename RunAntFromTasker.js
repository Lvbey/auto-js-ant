var path = engines.myEngine().cwd();
console.log("在"+path+"下，运行RunAnt.js");
engines.execScriptFile(path+"/RunAnt.js");

exit();