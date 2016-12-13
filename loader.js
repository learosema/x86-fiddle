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

const stringToByteArray = function(data) {
  // this is a bit hacky (todo: use binary xhr2 fetching)
  if (typeof data === 'string') { 
    return Array(data.length).fill(0).map((e,i) => data.charCodeAt(i)) 
  } 
  return data; 
} 

const CDN = 'https://terabaud.github.io/x86-fiddle/dosbox.js'

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
	initFS: {

	},
	run: function() {
		const Module = DOS.module
		Module.preRun.push(DOS.initFS)
		Module['arguments'] = ['./RUNME.BAT']
		var script = document.createElement('script')
        script.src = "dosbox.js"
        document.body.appendChild(script)	
	}
}