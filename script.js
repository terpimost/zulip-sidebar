// import { signal } from "https://cdn.skypack.dev/@preact/signals-core";

function onComposeStart() {
  document.getElementById('bottom_compose_area').classList.add('_open')
  document.getElementById('compose_body_editor_input_bottom').focus()
  window.addEventListener('resize', onDocumentResize)
  updateEditorButtonsScrollShadows()
}

function onDocumentResize() {
  updateEditorButtonsScrollShadows()
}

function onThemeSwitcherClick(){
  document.body.classList.toggle('dark')
}

// if click was on a row but not on a button or a link, this could be on the border of li
function onSidebarRowClick(event){
  if(event.target.classList.contains('sidebar-row')){
    event.target.querySelector('a').click()
  }
}