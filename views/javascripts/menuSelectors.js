var lastViewGroup
var lastAccGroup

function openSubGroupTouch (event, groupname) {
  event.preventDefault()
  openSubGroup(groupname)
}

function openSubGroup (groupName) {
  if (isTopGroup(groupName)) {
    if(lastAccGroup) {
      if (lastAccGroup === groupName) {
        // Case: last button is same button
        hideAll()
        lastAccGroup = undefined
        closeView()
      } else if (groupIsActive(groupName)) {
        // Case: the group was already activated: close all
        hideAll()
        closeView()
        lastAccGroup = undefined
      } else if (isTopGroup(lastAccGroup)) {
        // Case: last selected group was also top group 
        // => close other and open new
        hideGroup(lastAccGroup)
        showGroup(groupName)
        lastAccGroup = groupName
        closeView()
      } else {
        // Case: last group wasn't top group
        // => close everything and open new topgroup
        hideAll()
        showGroup(groupName)
        lastAccGroup = groupName
        closeView()
      }
    } else {
      // Case: first group selected
      showGroup(groupName)
      lastAccGroup = groupName
      closeView()
    }
  } else {
    if (groupIsActive(groupName)) {
      // Case: selected group was already active
      // => close selected group and the ones under and set parent as last active
      hideAll(groupName)
      lastAccGroup = getActiveParentName(groupName)
      closeView()
    } else if (lastIsParentGroup(groupName)) {
      // Case: last is parent group => just open next group
      showGroup(groupName)
      lastAccGroup = groupName
    } else if (lastIsSiblingGroup(groupName)) {
      // Case: last group is sibling group
      // => close sibling and open new
      hideGroup(lastAccGroup)
      showGroup(groupName)
      lastAccGroup = groupName
    } else {
      // Case: last group ins't a sibling group => sibling of new group must be active
      // => close that and open new group
      closeActiveSiblingGroup(groupName)
      showGroup(groupName)
      closeView()
      lastAccGroup = groupName
    }
  }
}

function openViewTouch(event, groupname) {
  event.preventDefault()
  openView(groupname)
}

function openView (groupName) {
  console.log('Opening view panel ', groupName)
  if (lastViewGroup) {
    if (lastViewGroup === groupName) {
      $('#'+lastViewGroup+'Content').addClass('hidden')
      $('#'+lastViewGroup+'ViewButton').removeClass('active')
      lastViewGroup = undefined
      return
    }
    $('#'+lastViewGroup+'Content').addClass('hidden')
    $('#'+lastViewGroup+'ViewButton').removeClass('active')
  }
  $('#'+groupName+'Content').removeClass('hidden')
  $('#'+groupName+'ViewButton').addClass('active')
  lastViewGroup = groupName
}

function closeView () {
  if (lastViewGroup) {
    $('#'+lastViewGroup+'Content').addClass('hidden')
    $('#'+lastViewGroup+'ViewButton').removeClass('active')
    lastViewGroup = undefined
  }
}

function hideGroup (groupName) {
  $('#'+groupName+'Panel').hide()
  $('#'+groupName).removeClass('active')
  $('#'+groupName+'AccButton').removeClass('active')
}

function showGroup (groupName) {
  $('#'+groupName+'Panel').show()
  $('#'+groupName).addClass('active')
  $('#'+groupName+'AccButton').addClass('active')
}

function hideAll (groupName) {
  if (groupName) {
    let subActive = $('#'+groupName+'Panel').children('.tabItem.active')
    if (subActive.length > 0) {
      console.log('closing: ', subActive[0].id)
      hideAll(subActive[0].id)
    }
    hideGroup(groupName)
  } else {
    console.log('Searching active')
    let active = $('.tabControl').children('.tabItem.active')
    if (active.length > 0) {
      console.log('closing: ', active[0].id)
      hideAll(active[0].id)
    }
  }
}

function isTopGroup (groupName) {
  return ($('.tabControl').children('#'+groupName).length > 0)
}

function lastIsParentGroup (groupName) {
  if (lastAccGroup) {
    return ($('#'+lastAccGroup+'Panel').children('#'+groupName).length > 0)
  } else {
    return false
  }
}

function lastIsSiblingGroup (groupName) {
  if (lastAccGroup) {
    return ($('#'+lastAccGroup).siblings('#'+groupName).length) > 0
  } else {
    return false
  }
}

function groupIsActive (groupName) {
  return $('#'+groupName).hasClass('active')
}

function closeActiveSiblingGroup (groupName) {
  hideAll($('#'+groupName).siblings('.tabItem.active')[0].id)
}

function getActiveParentName (groupName) {
  return $('#'+groupName).parent().prev('.active')[0].id
}