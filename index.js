var util = require('util');
var run = require('execSync').run;
process.env.DEBUG = '';//"hexo-backup"
var log = require('debug')("hexo-backup");

var backupOptions = {
    alias: 'b', // hexo backup/b
    options: [{
        name: '-i,--init',
        desc: '初始化备份,添加hexo branh,添加remote等'
    }]
}

// hexo is a global variable
hexo.extend.console.register("backup", "备份hexo主目录", backupOptions, backup);


/*
 * 将remote name 设为 backup
 * git checkout --orphan hexo #hexo branch
 * git push backup xxx.git
 */


function backup(args, cb) {
    if (!hexo.config.backup) {
        throw new Error("please add backup info into _config.yml, branch & repo ...");
    }

    log(hexo.base_dir)
    process.chdir(hexo.base_dir)

    var branch = hexo.config.backup.branch;
    var repo = hexo.config.backup.repo;

    // 初始化
    if (args.init || args.i) {
        log("要初始化呀呀");
        run("git init .")
        run(util.format("git checkout --orphan %s",branch));
        run(util.format("git remote add backup %s",repo));
        return;
    }

    // 常规备份
    log("要backup");
    run("git add --all")
    run(util.format('git commit -a -m "backup at %s"', getnow()))
    run(util.format("git push backup %s",branch))
    cb();
}

function getnow() {
    var ret = "%s-%s-%s %s:%s:%s"
    var d = new Date()

    var year = pad(d.getFullYear(), 4),
        mon = pad(d.getMonth() + 1, 2),
        day = pad(d.getDate(), 2),

        hour = pad(d.getHours(), 2),
        min = pad(d.getMinutes(), 2),
        sec = pad(d.getSeconds(), 2);

    return util.format(ret, year, mon, day, hour, min, sec);
}

function pad(original, len, char) {
    if (arguments.length < 2)
        throw new Error("must specify original_string & expect_length")

    char = char || '0';

    var ret = original.toString()
    while (ret.length < len) {
        ret = char + ret
    }

    return ret;
}