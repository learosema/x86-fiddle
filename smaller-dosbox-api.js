const http = (url) => {
	const xhr = new XMLHttpRequest()
	if (url.slice(-4) === ".zip") {
		// xhr.responseType = "arraybuffer"
	}
	xhr.open("GET", url, true)
	xhr.overrideMimeType('text/plain; charset=x-user-defined')
	xhr.send()
	return new Promise((yep, nope) => {
		xhr.onreadystatechange = () => {
			if (xhr.readyState != 4) return
			(xhr.status == 200 ? yep : nope)(xhr.responseText)
		}
	})
}

const stringToArray = function(data) {
	var arr, i, len;
	if (typeof data === 'string') {
		return Array(data.length).fill(0).map((e,i) => data.charCodeAt(i))
		/* arr = new Array(data.length);
		i = 0;
		len = data.length;
		while (i < len) {
			arr[i] = data.charCodeAt(i);
			++i;
		}
		return arr; */
	}
	return data;
}

const jsDosCDN = 'https://js-dos.com/cdn/js-dos.js'

const DOS = {
	module: {
		canvas: document.querySelector('.dosbox-canvas'),
		preRun: [],
		postRun: [],
		print: console.log.bind(),
		printErr: console.error.bind(),
		setStatus: console.log.bind(),
		monitorRunDependencies: (left) => {
            DOS.module.totalDependencies = Math.max(DOS.totalDependencies, left);
            const status = left ? "Preparing... (" + (DOS.totalDependencies - left) + "/" + DOS.totalDependencies + ")" : 'All downloads complete.';
            return DOS.module.setStatus(status);
		}
	},
	mountZip: (url) => {
		return new Promise((yep, nope) => {
			http(url).then(bytes => {
				DOS.mountZipBuffer(stringToArray(bytes))
				yep()
			})
		})
	},
	mountZipBuffer: (bytes) => {
		console.log(bytes.length)
		var buffer, extracted;
            buffer = DOS.module._malloc(bytes.length);
            DOS.module.HEAPU8.set(bytes, buffer);
            extracted = DOS.module.ccall('extract_zip', 'int', ['number', 'number'], [buffer, bytes.length]);
            DOS.module._free(buffer);
            return extracted === 0;
	},
	init: () => {
		return new Promise((yep, nope) => {
			if (! DOS.module.ccall) {
				http(jsDosCDN).then(script => {
					var Module = DOS.module
					eval(script)
					setTimeout(yep(), 1000)
				})
			} else {
				yep()
			}
		})
	},
	run: (executable) => {
		DOS.module.ccall('dosbox_main', 'int', ['string'], [executable]);
	}
}

// DOS.init().then(() => DOS.mountZip("https://js-dos.com/cdn/digger.zip")).then(() => DOS.run("./DIGGER.COM"))