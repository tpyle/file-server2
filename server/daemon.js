const config = require('./config.js')({ requiredFields: ['name'] });

var daemon = require("daemonize2").setup({
    main: "index.js",
    name: config.name,
    pidfile: `/var/run/${config.name}.pid`
});

if (process.getuid() != 0) {
	console.error("Expected to run as root");
	process.exit(1);
}

switch (process.argv[2]) {
 
    case "start":
        daemon.start();
        break;
 
    case "stop":
        daemon.stop();
        break;

    case "kill":
		daemon.kill();
		break;

    case "restart":
		daemon.stop(err=>{
			daemon.start();
		});
		break;
 
    case "status":
		let pid = daemon.status();
		if (pid) {
			console.log(`${config.name} running. PID: ${pid}`);
		} else {
			console.log(`${config.name} is not running.`);
		}
		break;

    default:
		console.log("Usage: [start|stop|kill|restart|status]");
}
