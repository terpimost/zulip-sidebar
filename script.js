// import { signal } from "https://cdn.skypack.dev/@preact/signals-core";
import { colord, random, extend } from 'https://unpkg.com/colord@2.9.3/index.mjs';
//color lib that we use
import lchPlugin from "https://unpkg.com/colord@2.9.3/plugins/lch.mjs";
import mixPlugin from 'https://unpkg.com/colord@2.9.3/plugins/mix.mjs';

//used only to get throttle, lodash is tree shakable, so it could be
// import throttle from "lodash/throttle"
import lodash from 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm'
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
function colorizeStreamRows() {
  const darkMode = document.body.classList.contains('dark')
  document.querySelectorAll('ul.sidebar-group-streams').forEach((sg, sg_i) => {
    [...sg.children].forEach((s, s_i) => {
      // console.log('s=', s);
      // console.log('sg_i + s_i=', sg_i + s_i);
      const color = streamColors[sg_i + s_i]
      colorizeStreamRow(s, color, darkMode)
      const possibleTopics = s.querySelector('ul.sidebar-topics')?.children;
      if (possibleTopics) {
        [...possibleTopics].forEach((t) => {
          colorizeStreamRow(t, color, darkMode)
        })
      }
    })
  })
}

function colorizeStreamRow(row, color, darkMode) {
  const correctedColor = correctStreamColor({ color, darkMode });
  const icon_el = row.querySelector('a .sidebar-row__icon')
  if (icon_el) {
    icon_el.style.color = correctedColor
  }
  const counter = row.querySelector('.unread-count');
  if (counter) {
    counter.style.backgroundColor = getCounterBackgroundColor({ color, darkMode })
    counter.style.color = darkMode ? 'rgb(255 255 255 / 90%)' : 'rgb(0 0 0 / 90%)';
  }
}

//should be called on theme change / topics open
colorizeStreamRows()


// Sidebar interactions related

//if a click was on some empty area of a summary consider it as a click on expander area
document.querySelectorAll('.sidebar-group__summary').forEach(ss => {
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
document.querySelectorAll('ul.sidebar-group__details>li').forEach(li => {
  li.addEventListener('keydown', onSidebarRowKeyDown)
})
function onSidebarRowKeyDown(event) {
  console.log('onSidebarRowKeyDown');
  if (event.key === 'Enter') {
    event.currentTarget.querySelector('a').click()
  }
}


document.querySelectorAll('.sidebar-group__expander-area').forEach(el => {
  el.addEventListener('click', onSidebarGroupExpanderAreaClick)
})
function onSidebarGroupExpanderAreaClick(event) {
  const sidebar = document.querySelector('.left-sidebar')
  let group = event.currentTarget.closest('.sidebar-group')
  let stickySummaryViewsOrDms
  let stickyParent
  if (!group) { //it is not a regular stream group but views or dms
    stickyParent = event.currentTarget.closest('.sidebar-group__summary-sticky')
    group = stickyParent.nextElementSibling
    stickySummaryViewsOrDms = stickyParent.querySelector('.sidebar-group__summary')
  }

  const expanded = group.classList.contains('_expanded')
  const groupDetails = group.querySelector('.sidebar-group__details')
  const stickyAreaAbove = stickyAreaHeightAboveDetails(groupDetails, stickyParent)
  if (expanded) {//we will fold the group
    if (stickyAreaAbove) { //scroll to the beginning of the current element
      //so when it folds, we are at expected place visually
      group.scrollIntoView(true)
      //compensate for sticky
      sidebar.scrollTo({
        top: sidebar.scrollTop - stickyAreaAbove,
        behavior: 'instant',
      })
    }
    group.classList.remove('_expanded')
    if (stickySummaryViewsOrDms) stickySummaryViewsOrDms.classList.remove('_expanded')

  } else {//we will expand the group
    group.classList.add('_expanded')
    if (stickySummaryViewsOrDms) {
      stickySummaryViewsOrDms.classList.add('_expanded')
      //user might scrolled down, so we should scroll to the expanded area
      if (stickyAreaAbove) {
        group.scrollIntoView(true)
        sidebar.scrollTo({
          top: sidebar.scrollTop - stickyAreaAbove,
          behavior: 'instant',
        })
      }
    }
  }
}

function stickyAreaHeightAboveDetails(element, stickyParent) {
  const sidebar = document.querySelector('.left-sidebar')

  const elementRect = element.getBoundingClientRect()
  const sidebarRect = sidebar.getBoundingClientRect()
  let totalStickyHeight = 0

  const isAbove = (totalHeight) => (sidebarRect.top + totalHeight) > elementRect.top
  // possible stack of sticky elements is views(possible view outside folded views)+dms+(possible dm outside folded dms)+separator
  // for now we are ignoring possible view/dm outside their container, but later such should be factored in calculation

  const viewsSticky = sidebar.querySelector('.summary-sticky-views')

  const viewsStickyHeight = viewsSticky.offsetHeight
  totalStickyHeight += viewsStickyHeight
  if (stickyParent == viewsSticky) {
    if (isAbove(totalStickyHeight)) return totalStickyHeight
    else return 0
  }

  const viewStickyHeight = 0 // TODO detect that it exists in case of views are folded and get offsetHeight

  const dmsSticky = sidebar.querySelector('.summary-sticky-dms')
  const dmsStickyHeight = dmsSticky.offsetHeight
  totalStickyHeight += viewStickyHeight + dmsStickyHeight
  if (stickyParent == dmsSticky) {
    if (isAbove(totalStickyHeight)) return totalStickyHeight
    else return 0
  }

  const dmStickyHeight = 0 // TODO detect that it exists in case of views are folded and get offsetHeight

  const separatorStickyHeight = sidebar.querySelector('.summary-sticky-views-dms-separator').offsetHeight

  // we don't include current group sticky since we want it to be visible and only above content matters
  // const streamGroup = element.closest('.sidebar-group').querySelector('.summary-sticky-stream')
  // const streamGroupHeigh = streamGroup.offsetHeight
  totalStickyHeight += (dmStickyHeight + separatorStickyHeight)
  if (isAbove(totalStickyHeight)) return totalStickyHeight

  const streamHeight = 0 // TODO detect that there is a stream of folded group outside that group above the element
  totalStickyHeight += streamHeight

  if (isAbove(totalStickyHeight)) return totalStickyHeight
  else return 0
}

// const interceptViews = document.getElementById('intercept_views')
// const interceptDms = document.getElementById('intercept_dms')
// const interceptStreams = document.getElementsByClassName('intercept_stream')
// const rowIntersectionObserver = new IntersectionObserver(([entry]) => {
//   const stickyEl = entry.target.nextElementSibling
//   stickyEl.classList.toggle('_covering', !entry.isIntersecting)

//   // switching shadow so when scroll back fast it isn't blinking
//   if (entry.target.id == 'intercept_dms') {
//     interceptViews.nextElementSibling.classList.toggle('_covering', entry.isIntersecting)
//   } else if (interceptStreams[0] == entry.target && entry.target.classList.contains('intercept_stream')) {
//     interceptDms.nextElementSibling.classList.toggle('_covering', entry.isIntersecting)
//   }
// });
// rowIntersectionObserver.observe(interceptViews);
// rowIntersectionObserver.observe(interceptDms);
// [...interceptStreams].map(s => rowIntersectionObserver.observe(s))

//sidebar scroll tracker to control shadow under group header 
// and _overscrolled status for groups which are _expanded

function onLeftSidebarScroll() {

  const groups = document.querySelectorAll('.sidebar-group')
  groups.forEach(group => {
    //.sidebar-group__summary-sticky will be either a child or prev sibling
    let sticky_header = group.querySelector('.sidebar-group__summary-sticky')
    if (!sticky_header?.classList.contains('sidebar-group__summary-sticky')) {
      sticky_header = group.previousElementSibling
    }

    if (group.classList.contains('_expanded')) {
      const details = group.querySelector('.sidebar-group__details')
      const details_rect = details.getBoundingClientRect()
      const sticky_header_rect = sticky_header.getBoundingClientRect()
      if(details_rect.top < sticky_header_rect.bottom-4){
        sticky_header.classList.add('_covering')
      }else{
        sticky_header.classList.remove('_covering')
      }
    } else {
      sticky_header.classList.remove('_covering')
    }
  })
}

const onLeftSidebarScrollThrottled = lodash.throttle(onLeftSidebarScroll, 200)
document.getElementById('left-sidebar').addEventListener('scroll', onLeftSidebarScrollThrottled)


// sidebar modal related
document.querySelectorAll('.button-close-modal').forEach(el => {
  el.addEventListener('click', closeSidebarModal)
})

function closeSidebarModal(e) {
  e.currentTarget.closest('.sidebar-modal-content').style.display = 'none'
  e.currentTarget.closest('.left-sidebar-modal').style.display = 'none'
}

//click on a free space above the modal to close it
document.querySelector('.left-sidebar-modal').addEventListener('click', (e) => {
  if (e.currentTarget === e.target) {
    e.currentTarget.style.display = 'none'
    e.currentTarget.querySelectorAll('.sidebar-modal-content').forEach(e => e.style.display = 'none')
  }
})

//opening model by the click on more topics button
document.querySelectorAll('.button-more-topics>a').forEach(el => {
  el.addEventListener('click', openTopicModal)
})

function openTopicModal(e) {
  document.querySelector('.sidebar-modal-content').style.display = 'flex'
  document.querySelector('.left-sidebar-modal').style.display = 'flex'
}