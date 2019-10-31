const fs = require('fs');

function getConfig(file /*, options*/) {
	let options;
	if (typeof(file)==='object') {
		options = file;
		file = './config.json';
	} else {
		options = arguments[1];
	}
	let { requiredFields, required, defaultConfig } = Object.assign({},
										{ requiredFields: [], 
										  required: false, 
										  defaultConfig: {} }, 
										options);
	
	let config_data;
	try {
		config_data = fs.readFileSync(file);
	} catch(err) {
		if (required) {
			throw { message: 'Failed to read file', err };
		}
		config_data = "{}";
	}

	let config = {}
	try {
		config = JSON.parse(config_data);
	} catch (err) {
		if (required) {
			throw { message: 'Malformed Config', err };
		}
		const config = {};
	}
	
	let needs = new Set(requiredFields);
	let has = new Set(Object.keys(config));
	let difference = new Set([...needs].filter(x => !has.has(x)));
	if (difference.size > 0) {
		throw { message: 'Missing Fields', err: [...difference] };
	}
	
	return Object.assign({},defaultConfig,config);
}

module.exports = getConfig;
