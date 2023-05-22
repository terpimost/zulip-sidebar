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
    event.currentTarget.querySelector('a').click()
  }
}
function onSidebarGroupClick(event){
  if(event.target.classList.contains('sidebar-group__summary')){
    event.currentTarget.querySelector('.sidebar-group__expander-area').click()
  }
}

// if tabbed focus to the element and hit Enter we wat the link to be working
// since for sibar-row li elements we have tabindex="0" whil for <a> we have tabindex="-1"
function onSidebarRowKeyDown(event){
  if(event.key==='Enter'){
    event.currentTarget.querySelector('a').click()
  }
}
function onSidebarGroupKeyDown(event){
  if(event.key==='Enter'){
    event.currentTarget.querySelector('.sidebar-group__expander-area').click()
  }
}

function onSidebarGroupExpanderAreaClick(event){
  console.log(event.currentTarget.closest('.sidebar-group'));
  event.currentTarget.closest('.sidebar-group').classList.toggle('_expanded')
}

const interceptViews = document.getElementById('intercept_views')
const interceptDms = document.getElementById('intercept_dms')
const interceptStreams = document.getElementsByClassName('intercept_stream')
const rowIntersectionObserver = new IntersectionObserver(([entry]) => {
  const stickyEl = entry.target.nextElementSibling
  stickyEl.classList.toggle('_covering', !entry.isIntersecting)

  // switching shadow so when scroll back fast it isn't blinking
  if(entry.target.id == 'intercept_dms'){
    interceptViews.nextElementSibling.classList.toggle('_covering', entry.isIntersecting)
  } else if(interceptStreams[0]==entry.target && entry.target.classList.contains('intercept_stream')){
    interceptDms.nextElementSibling.classList.toggle('_covering', entry.isIntersecting)
  }
});
rowIntersectionObserver.observe(interceptViews);
rowIntersectionObserver.observe(interceptDms);
[...interceptStreams].map(s=>rowIntersectionObserver.observe(s))