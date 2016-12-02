const q = document.querySelector.bind(document)
const editor = ace.edit("editor")
editor.setTheme("ace/theme/monokai")
editor.getSession().setMode("ace/mode/assembly_x86")
editor.getSession().setTabSize(8)
editor.setValue(q('#demoCode').textContent)

const HelloWorldDotCom = "X5O!P%@AP[4\PZX54(P^)7CC)7}$HELLO-WORLD!$H+H*"

function run() {
	var dosbox = new Dosbox({
           id: "dosbox",
           onload: function (dosbox) {
             dosbox.run("https://js-dos.com/cdn/digger.zip", "./DIGGER.COM")
           },
           onrun: function (dosbox, app) {
             console.log("App '" + app + "' is runned")
           }
         });
}

q('#btnRun').onclick = () => {
	DOS.init().then(() => DOS.mountZip("https://terabaud.github.io/x86-fiddle/dos.zip")).then(() => DOS.run("./ANIM.COM"))
}