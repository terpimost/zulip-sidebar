// import { signal } from "https://cdn.skypack.dev/@preact/signals-core";
import { colord, extend } from 'https://unpkg.com/colord@2.9.3/index.mjs';
//color lib that we use
import lchPlugin from "https://unpkg.com/colord@2.9.3/plugins/lch.mjs";
import mixPlugin from 'https://unpkg.com/colord@2.9.3/plugins/mix.mjs';
extend([lchPlugin, mixPlugin]);


//utils for demo
function onComposeStart() {
  document.getElementById('bottom_compose_area').classList.add('_open')
  document.getElementById('compose_body_editor_input_bottom').focus()
  window.addEventListener('resize', onDocumentResize)
  updateEditorButtonsScrollShadows()
}

function onDocumentResize() {
  updateEditorButtonsScrollShadows()
}

document.querySelector('.theme_switcher').addEventListener('click', onThemeSwitcherClick)
function onThemeSwitcherClick() {
  document.body.classList.toggle('dark')
}


//Colors related
const ZULIP_ASSIGNMENT_COLORS = [
  "#76ce90",
  "#fae589",
  "#a6c7e5",
  "#e79ab5",
  "#bfd56f",
  "#f4ae55",
  "#b0a5fd",
  "#addfe5",
  "#f5ce6e",
  "#c2726a",
  "#94c849",
  "#bd86e5",
  "#ee7e4a",
  "#a6dcbf",
  "#95a5fd",
  "#53a063",
  "#9987e1",
  "#e4523d",
  "#c2c2c2",
  "#4f8de4",
  "#c6a8ad",
  "#e7cc4d",
  "#c8bebf",
  "#a47462",
];
let streamColors = [];
const streamGroupsULs = document.querySelectorAll('ul.sidebar-group-streams')
console.log('streamGroupsULs=', streamGroupsULs);


// Sidebar interactions related

//if a click was on some empty area of a summary consider it as a click on expander area
document.querySelectorAll('.sidebar-group__summary').forEach(ss=>{
  ss.addEventListener('click', onSidebarGroupClick)
  ss.addEventListener('keydown', onSidebarGroupKeyDown)
})
function onSidebarGroupClick(event) {
  if (event.target.classList.contains('sidebar-group__summary')) {
    event.currentTarget.querySelector('.sidebar-group__expander-area').click()
  }
}
function onSidebarGroupKeyDown(event) {
  if (event.key === 'Enter') {
    event.currentTarget.querySelector('.sidebar-group__expander-area').click()
  }
}

// if tabbed focus to the element and hit Enter we wat the link to be working
// since for sibar-row li elements we have tabindex="0" whil for <a> we have tabindex="-1"
document.querySelectorAll('ul.sidebar-group__details>li').forEach(li=>{
  li.addEventListener('keydown', onSidebarRowKeyDown)
})
function onSidebarRowKeyDown(event) {
  if (event.key === 'Enter') {
    event.currentTarget.querySelector('a').click()
  }
}


document.querySelectorAll('.sidebar-group__expander-area').forEach(el=>{
  el.addEventListener('click',onSidebarGroupExpanderAreaClick)
})
function onSidebarGroupExpanderAreaClick(event) {
  if (event.currentTarget.parentElement.classList.contains('sidebar-group-dms')) {
    [...document.querySelectorAll('.sidebar-group-dms')].map(e => e.classList.toggle('_expanded'))
    if (document.querySelector('.sidebar-group-dms').classList.contains('_expanded')) {
      //scroll to if needed
      // we can't use scroll into view because of expantion animation, but we don't want to wait
      const el = document.querySelector('.sidebar-group._expanded.sidebar-group-dms')
      const rect = el.getBoundingClientRect();
      if (rect.top < 102) {
        document.querySelector('.left-sidebar').scrollTo({
          behavior: 'smooth',
          top: el.offsetTop - 60
        })
      }
      //remove covering shadow
      document.querySelector('.summary-sticky-dms').classList.remove('_covering')
    }
  } else if (event.currentTarget.parentElement.classList.contains('sidebar-group-views')) {
    [...document.querySelectorAll('.sidebar-group-views')].map(e => e.classList.toggle('_expanded'))
    //scroll to top since in any case we should be up
    document.querySelector('.left-sidebar').scrollTo({
      behavior: 'smooth',
      top: 0
    })
    //remove covering shadow
    document.querySelector('.summary-sticky-views').classList.remove('_covering')

  } else {
    event.currentTarget.closest('.sidebar-group').classList.toggle('_expanded')
  }
}


const interceptViews = document.getElementById('intercept_views')
const interceptDms = document.getElementById('intercept_dms')
const interceptStreams = document.getElementsByClassName('intercept_stream')
const rowIntersectionObserver = new IntersectionObserver(([entry]) => {
  const stickyEl = entry.target.nextElementSibling
  stickyEl.classList.toggle('_covering', !entry.isIntersecting)

  // switching shadow so when scroll back fast it isn't blinking
  if (entry.target.id == 'intercept_dms') {
    interceptViews.nextElementSibling.classList.toggle('_covering', entry.isIntersecting)
  } else if (interceptStreams[0] == entry.target && entry.target.classList.contains('intercept_stream')) {
    interceptDms.nextElementSibling.classList.toggle('_covering', entry.isIntersecting)
  }
});
rowIntersectionObserver.observe(interceptViews);
rowIntersectionObserver.observe(interceptDms);
[...interceptStreams].map(s => rowIntersectionObserver.observe(s))