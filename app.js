const q = document.querySelector.bind(document)
const editor = ace.edit("editor")
editor.setTheme("ace/theme/monokai")
editor.getSession().setMode("ace/mode/assembly_x86")
editor.getSession().setTabSize(8)
q('#editor').style.fontSize="3vh"
editor.setValue(q('#demoCode').textContent)


q('#btnRun').onclick = () => {
	DOS.init().then(() => DOS.mountZip("https://terabaud.github.io/x86-fiddle/dos.zip")).then(() => DOS.run("./ANIM.COM"))
}