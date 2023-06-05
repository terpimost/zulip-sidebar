// import { signal } from "https://cdn.skypack.dev/@preact/signals-core";
import { colord, random, extend } from 'https://unpkg.com/colord@2.9.3/index.mjs';
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
  colorizeStreamRows()
}


//Colors related

// preparing array of different colors
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
const EXTREME_COLORS = [
  "#FFFFFF", // White
  "#000000", // Black
  "#D3D3D3", // Light Grey
  "#A9A9A9", // Dark Grey
  "#808080", // Grey (50% Black)
  "#FFFF00", // Yellow
  "#FF0000", // Red
  "#008000", // Green
  "#0000FF", // Blue
  "#EE82EE", // Violet
  "#FFA500", // Orange
  "#800080", // Purple
  "#00FFFF", // Aqua
  "#FF00FF", // Magenta
  "#00FF00", // Lime
  "#800000", // Maroon
  "#008080", // Teal
  "#000080", // Navy
  "#FFFFE0", // LightYellow
  "#FF69B4", // HotPink
];
let streamColors = [];
streamColors = ZULIP_ASSIGNMENT_COLORS.concat(EXTREME_COLORS)


// we don't use this function here but it is available
function getRecipientBarColor({ color = "#000000", darkMode = false }) {
  return colord(darkMode ? "#000000" : "#f9f9f9").mix(color, darkMode ? 0.38 : 0.22).toHex();
}
//this is a new function
function getCounterBackgroundColor({ color = "#000000", darkMode = false }) {
  //counter color: stream color > LCH > L= 70 >RGB , alpha = 0.2 for light theme, alpha = 0.4 for dark theme
  let min_color_l = 30;
  let max_color_l = 70;
  let alpha = 0.3
  let color_l = colord(color).toLch().l
  let counterBgColor = color
  
  if (color_l < min_color_l) {
    counterBgColor = colord({ ...colord(color).toLch(), l: min_color_l }).toHex(); 
  } else if (color_l > max_color_l) {
    counterBgColor = colord({ ...colord(color).toLch(), l: max_color_l }).toHex();
  } 
  return colord(counterBgColor).alpha(0.3).toHex()
}
// this function should be already in Zulip
function correctStreamColor({ color = "#000000" }) {
  let color_l, min_color_l, max_color_l;
  min_color_l = 20;
  max_color_l = 75;
  color_l = colord(color).toLch().l //chroma.js color_l = chroma(color).get("lch.l");

  if (color_l < min_color_l) {
    return colord({ ...colord(color).toLch(), l: min_color_l }).toHex(); //chroma(color).set("lch.l", min_color_l).hex();
  } else if (color_l > max_color_l) {
    return colord({ ...colord(color).toLch(), l: max_color_l }).toHex(); //chroma(color).set("lch.l", max_color_l).hex();
  } else {
    return color;
  }
}

//going through streams and colorizing icons and badges
function colorizeStreamRows(){
  const darkMode = document.body.classList.contains('dark')
  document.querySelectorAll('ul.sidebar-group-streams').forEach((sg,sg_i)=>{
    [...sg.children].forEach((s,s_i)=>{
      console.log('sg_i + s_i=', sg_i + s_i);
      const color = streamColors[sg_i + s_i]

      const correctedColor = correctStreamColor({ color, darkMode });
      const icon_el = s.querySelector('a .sidebar-row__icon')
      if(icon_el){
        icon_el.style.color = correctedColor
      }
      const counter = s.querySelector('.unread-count');
      if(counter){ 
        counter.style.backgroundColor = getCounterBackgroundColor({color, darkMode})
        counter.style.color = darkMode?'rgb(255 255 255 / 90%)':'rgb(0 0 0 / 90%)';
      }
    })
  })
}

//should be called on theme change
colorizeStreamRows()


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