const q = document.querySelector.bind(document)
const editor = ace.edit("editor")
editor.setTheme("ace/theme/monokai")
editor.getSession().setMode("ace/mode/assembly_x86")
editor.getSession().setTabSize(8)
editor.setValue(q('#demoCode').textContent, -1)


q('#btnRun').onclick = () => {






}