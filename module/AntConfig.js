var AntConfig = {};

AntConfig.ExescriptFileName = "Ant.js";
AntConfig.ProjectName = "auto-js-ant";

//这个地址不能变动
AntConfig.VersionUrl = "https://gitee.com/Lvbey/auto-js-ant/raw/release/version";

// AntConfig.DownloadUrl = "https://gitee.com/Lvbey/auto-js-ant/repository/archive/release.zip";
AntConfig.DownloadUrl = "https://www.lvbey.com/attachment/auto-js-ant-release.zip";//"https://github.com/Lvbey/auto-js-ant/archive/release.zip";


AntConfig.StorageName = "auto-js-ant";
AntConfig.StorageLoginPassName = "loginpass";


AntConfig.WorkDirPath = engines.myEngine().cwd();


module.exports = AntConfig;
