

function getel(x) {
    return document.getElementById(x)
}
function postData(url, body, callBack) {
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${localStorage.getItem('auth')}`
        }
    }).then(resp => { return resp.json() })
        .then(data => { callBack(data) })
}
function getData(url, callBack) {
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${localStorage.getItem('auth')}`
        }
    }).then(resp => { return resp.json() })
        .then(data => { callBack(data) })
}

var ad = new Audio('https://firebasestorage.googleapis.com/v0/b/pqrs-9e8eb.appspot.com/o/y2mate.com%20-%20NOKIA%20RINGTONE%201994.mp3?alt=media&token=2e5508ae-4909-4233-8e47-29a043bee689')

function rejectCall() {
    ad.pause()
}

var availableUsers = {}

var membersRoot = getel('membersRoot')
var currentlyShowingType = 1
var socket = io()
var mygroups = {}
var currentlyActive = -1


getel('friendspanel').onclick = () => {
    currentlyShowingType = 1
}

var messageBar = getel('send')
messageBar.style.display = 'none'

var menubarStatus = 0;
var sidebaStatus = 0
getel('menubar').onclick = () => {
    getel('menubar').style.color = 'blue'
    if (!menubarStatus) {
        getel('sidebar').style.maxWidth = '95vw';
        getel('sidebar').style.width = '100%';
        getel('body').style.maxWidth = '0'
        getel('messageWithHeader').style.display = 'none';
        getel('shendmsform').style.display = 'none'
    }
    else {
        getel('messageWithHeader').style.display = 'block'
        getel('sidebar').style.maxWidth = '0';
        getel('body').style.maxWidth = '100vw';
        getel('shendmsform').style.display = 'block'
    }
    menubarStatus ^= 1;
}


socket.emit('userpageID', { me: myID })

availableUsers[myID] = {
    ID: myID,
    uname: myName,
    propic: myproPic
}
getel('friendspanel').onclick = () => {
    getel('friendspanel').style.color = 'blue'
    $('#sidepageModal').modal({ show: true })
    currentlyShowingType = 1;
}

var friendsList = []

function getMyFriends() {
    var root = currentlyShowingType ? friendsRoot : membersRoot
    getData('/myfriends', dt => {
        if (dt.data.length) friendsRoot.innerHTML = ''
        else friendsRoot.innerHTML = 'Looks like you need friends :('
        dt.data.forEach(dat => {
            myFriend(dat, root)
            availableUsers[dat.ID] = dat
            availableUsers[dat.ID]['relation'] = 1;
        });
    })
}
var rootContainer = getel('sidepageItems')


function setAvailable(id) {
    getData('/findUsr/' + id, (res) => {
        availableUsers[id] = res.data
    })

}

var friendsRoot = document.createElement('div')
friendsRoot.innerHTML = 'nothing yet!'
var requestsRoot = document.createElement('div')
requestsRoot.innerHTML = 'nothing yet!'
var pending_root = document.createElement('div')
pending_root.innerHTML = 'nothing yet!';
getel('myfriends').classList.add('red')
var othersRoot = document.createElement('div')
rootContainer.appendChild(friendsRoot)
$(document).ready(() => {
    getMyFriends();
    getMyLastms();
    getAllgroupNames();
})

function getAjax(url) {
    var dt = {
        url: url,
        contentType: 'application/json'
    }
    return dt
}



getel('myfriends').onclick = () => {
    rootContainer.innerHTML = ''
    getel('myfriends').classList.add('red')
    getel('myRequests').classList.remove('red')
    getel('mypending').classList.remove('red')
    getel('others').classList.remove('red')
    getel('myfriends').classList.remove('redd')
    getel('myfriends').classList.add('leningrad')

    rootContainer.appendChild(friendsRoot)
    getMyFriends()
}
getel('myRequests').onclick = () => {
    rootContainer.innerHTML = '';

    getel('myfriends').classList.remove('red')
    getel('myRequests').classList.add('red')
    getel('mypending').classList.remove('red')
    getel('others').classList.remove('red')

    getel('myRequests').classList.remove('redd')
    getel('myRequests').classList.add('leningrad')

    rootContainer.appendChild(requestsRoot)
    getrequests()
}
getel('mypending').onclick = () => {
    rootContainer.innerHTML = ''
    getMyPending()

    getel('myfriends').classList.remove('red')
    getel('myRequests').classList.remove('red')
    getel('mypending').classList.add('red')
    getel('others').classList.remove('red')

    getel('mypending').classList.remove('redd')
    getel('mypending').classList.add('leningrad')

}
getel('others').onclick = () => {
    rootContainer.innerHTML = ''
    rootContainer.appendChild(othersRoot)
    getOthers(1)

    getel('myfriends').classList.remove('red')
    getel('myRequests').classList.remove('red')
    getel('mypending').classList.remove('red')
    getel('others').classList.add('red')

    getel('others').classList.remove('redd')
    getel('others').classList.add('leningrad')

}

function myFriend(user, root, typ) {
    var s = `
    <div id="friendId${currentlyShowingType}${user.ID}" class="sidepageItem myFriend d-flex" >
        <img src="${user.propic}" alt="" class="userpropic">

        <div class="myFriendName NAME" id="myfriendName${user.ID}">${user.uname}</div>
        <div class="ChatWithBTN" id="chatButton" onclick="chatWith(${user.ID})"><i class="fas fa-comment"></i></div>
        <div class="unfriendBtn" onclick="unfriend(${user.ID},'${user.uname}',${currentlyShowingType},'${user.propic}')">unfriend!</div>
    </div>
    `
    root.innerHTML += s;
}

function unfriend(ID, uname, typ, propic) {
    postData('/unfr', { ID: ID }, (rs) => {

        root = currentlyShowingType ? friendsRoot : getel('membersRoot')
        root.removeChild(getel(`friendId${currentlyShowingType}${ID}`))
        var root1 = currentlyShowingType ? othersRoot : membersRoot
        otherGuy({ ID: ID, uname: uname, propic: propic }, root1, typ)
        try {
            getel('messageList').removeChild(getel(`listItem${ID}`))
        } catch (error) {

        }
        if (ID == currentlyActive && !currentlyActiveTyp) {
            getel('messagebox').innerHTML = '';
            currentlyActive = -1
        }
        availableUsers[ID].relation = 4
        socket.emit('unfriended', { sender: myID, reciever: ID })
    })

}

socket.on('friendremoved', (user) => {
    var root = currentlyShowingType ? friendsRoot : membersRoot;
    var root2 = currentlyShowingType ? othersRoot : membersRoot
    root.removeChild(getel(`friendId${currentlyShowingType}${user.ID}`))
    if (user.ID == currentlyActive && !currentlyActive) {
        var headerRoot = getel('headerRoot')
        headerRoot.innerHTML = `
        <div id="noneRoot">
            <h3>Select a conversation</h3>
        </div>
        `
        currentlyActive = -1
        getel('messagebox').innerHTML = ''
    }
    try {
        getel('messageList').removeChild(getel(`listItem${user.ID}`))
    } catch (error) {
    }
    otherGuy(user, root2, 1)
})
function focs(id) {
    var elm = document.getElementsByClassName(id);
    if (elm == null || elm.length == 0) return;
    elm = elm[elm.length - 1].offsetTop;
    getel('messagContaniner').scrollTop = elm
}


function getOthers(typ) {

    var root = (currentlyShowingType ? othersRoot : getel('membersRoot'))
    getData('/everyone', (res) => {
        var everyone = res.data;
        getData('/mybds', (bds) => {
            var mybds = bds.data;
            getData('/mysentrqsts', (sntrq) => {
                var mysentrqsts = sntrq.data;
                getData('/frdreqs', (myrq) => {

                    root.innerHTML = ''
                    var frdrqs = myrq.data;
                    var vis = new Map()
                    for (let n = 0; n < everyone.length; n++) {
                        vis.set(everyone[n].ID, 0);
                        everyone[n]['type'] = 0;
                    }
                    for (let n = 0; n < mybds.length; n++) {
                        vis.set(mybds[n].fr1, 2)
                        vis.set(mybds[n].fr2, 2)
                    }
                    for (let n = 0; n < mysentrqsts.length; n++) {
                        vis.set(mysentrqsts[n].reciever, 1)
                    }
                    for (let n = 0; n < frdrqs.length; n++) {
                        vis.set(frdrqs[n].sender, 2)
                    }
                    var ans = []
                    for (let n = 0; n < everyone.length; n++) {
                        if (vis.get(everyone[n].ID) == 0) {
                            ans.push(everyone[n])
                        }
                    }
                    renderlist(ans, typ)
                })

            })

        })

    })

}



function renderlist(data, typ) {
    var root = currentlyShowingType ? othersRoot : getel('membersRoot')
    if (data.length) root.innerHTML = ''
    data.forEach((user) => {
        otherGuy(user, root, typ)
        availableUsers[user.ID] = user
        availableUsers[user.ID]['relation'] = 4
    })
}

function otherGuy(user, root, typ) {
    var s = `
    <div id="otherGuy${currentlyShowingType}${user.ID}" class="sidepageItem otherGuy d-flex justify-content-between" >
        <img src="${user.propic}" alt="" class="userpropic">
        <div class="otherGuyName NAME" id="otherGuyNameID${user.ID}">${user.uname}</div>
        <div class="addFriendBtn" onclick="addFriend(${user.ID},'${user.uname}',${currentlyShowingType},'${user.propic}')">Add Friend!</div>
    </div>
    `
    root.innerHTML += s;
}


function addFriend(ID, uname, typ, propic) {
    var data =
        /**/
        postData('/sendFriendRequest', { reciever: ID }, (res) => {

            var data = { sender: myID, reciever: ID }
            socket.emit('sentfriendreq', data)
            var root2 = currentlyShowingType ? othersRoot : membersRoot
            root2.removeChild(getel(`otherGuy${currentlyShowingType}${ID}`))
            var root = (currentlyShowingType ? pending_root : getel('membersRoot'))
            renderMysentrqs({ ID: ID, uname: uname, propic: propic }, root, currentlyActiveTyp)
            availableUsers[ID].relation = 2
        })

}

function getMyPending() {
    pending_root.innerHTML = 'Loading...'
    var root = currentlyShowingType ? pending_root : membersRoot
    getData("/mypending", function (dt) {
        if (dt.data.length) pending_root.innerHTML = ''
        else pending_root.innerHTML = 'No pending requests!'
        dt.data.forEach(user => {
            renderMysentrqs(user, root, 1)
            availableUsers[user.ID] = user
            availableUsers[user.ID]['relation'] = 2;

        })
        rootContainer.appendChild(pending_root)

    })

}

function renderMysentrqs(user, roo, typ) {
    var s = `
    <div id="myPendings${currentlyShowingType}${user.ID}" class="sidepageItem myPending d-flex" >
        <img src="${user.propic}" alt="" class="userpropic">
        <div class="pendingName NAME" id="pendingNameID${user.ID}">${user.uname}</div>
        <div class="cancelReqBtn" onclick="cancelRq(${user.ID},'${user.uname}',${currentlyShowingType},'${user.propic}')">Cancel request!</div>
    </div>
    `
    roo.innerHTML = s + roo.innerHTML;
}



function getrequests() {
    var root = currentlyShowingType ? requestsRoot : membersRoot
    root.innerHTML = 'Loading...'
    getData("/myreqs", function (dt) {
        if (dt.data.length)
            requestsRoot.innerHTML = ''
        else requestsRoot.innerHTML = 'No requests yet'
        for (let n = 0; n < dt.data.length; n++) {
            requests(dt.data[n], root, currentlyShowingType)
            availableUsers[dt.data[n].ID] = dt.data[n]
            availableUsers[dt.data[n].ID]['relation'] = 3
        }
    })
}

function requests(user, root, typ) {

    var s = `
    <div id="myrequests${currentlyShowingType}${user.ID}" class="sidepageItem requests d-flex">
        <img src="${user.propic}" alt="" class="userpropic">

        <div class="reqsName NAME" id="reqsNameID${user.ID}">${user.uname}</div>
        <div class="acceptBtn" onclick="acceptReq(${user.ID},'${user.uname}','${user.propic}')">Accept request!</div>
        <div class="rejectBtn" onclick="rejectReq(${user.ID},'${user.uname}','${user.propic}')">reject request!</div>
    </div>
    `
    root.innerHTML = s + root.innerHTML;
}

function acceptReq(ID, uname, propic) {

    var root = currentlyShowingType ? requestsRoot : getel('membersRoot')
    var root1 = currentlyShowingType ? friendsRoot : membersRoot
    root.removeChild(getel(`myrequests${currentlyShowingType}${ID}`))
    postData('/conf', { sender: ID }, (dt) => {
        postData('/createfriend', { fr1: myID, fr2: ID }, (resp) => {

            socket.emit('accepted', { sender: myID, reciever: ID })
            availableUsers[ID].relation = 1
            myFriend({ ID: ID, uname: uname, propic: propic }, root1, currentlyShowingType)
        })

    })

}

function rejectReq(ID, uname, propic) {

    var dat = JSON.stringify()
    var root = currentlyShowingType ? requestsRoot : membersRoot
    var root1 = currentlyShowingType ? othersRoot : getel('membersRoot')

    root.removeChild(getel(`myrequests${currentlyShowingType}${ID}`))
    otherGuy({ ID: ID, uname: uname, propic: propic }, root1)
    postData('/conf', { sender: ID }, (dt) => {
        socket.emit('rejected', { sender: myID, reciever: ID })
    })

}

function cancelRq(ID, uname, typ, propic) {

    var data = JSON.stringify()
    var root = currentlyShowingType ? pending_root : getel('membersRoot')
    root.removeChild(getel(`myPendings${currentlyShowingType}${ID}`))
    postData('/delrq', { reciever: ID }, (rs) => {
        otherGuy({ ID: ID, uname: uname, propic: propic }, othersRoot, typ);
        socket.emit('cancelledReqs', { sender: myID, reciever: ID })
    })

}

socket.on('friendReqAccepted', (user) => {
    getel('myfriends').classList.add('redd')
    getel('myfriends').classList.remove('leningrad')
    var root = currentlyShowingType ? pending_root : membersRoot
    try {
        root.removeChild(getel(`myPendings${currentlyShowingType}${user.ID}`))
    } catch (error) {

    }
    myFriend(user, (currentlyShowingType ? friendsRoot : membersRoot), currentlyShowingType)
})

socket.on('requestRejected', (dat) => {
    var root1 = currentlyShowingType ? pending_root : membersRoot;
    var root2 = currentlyShowingType ? othersRoot : membersRoot;
    root1.removeChild(getel(`myPendings${currentlyShowingType}${dat.ID}`))
    otherGuy(dat, root2, currentlyShowingType);
})

socket.on('recievedReq', (user) => {
    getel('friendspanel').style.color = 'red'
    getel('myRequests').classList.add('redd')
    getel('myRequests').classList.remove('leningrad')

    var root1 = currentlyShowingType ? othersRoot : getel('membersRoot')
    var root2 = currentlyShowingType ? requestsRoot : membersRoot
    try {
        root1.removeChild(getel(`otherGuy${currentlyShowingType}${user.ID}`))
    } catch (error) {
    }
    requests(user, root2, currentlyShowingType)
    availableUsers[user.ID].relation = 3
})

socket.on('requestRemoved', (user) => {
    var root = currentlyShowingType ? othersRoot : membersRoot
    otherGuy(user, root, currentlyShowingType);
    getrequests()
})



function messageTR(message) {
    var s = ``;
    if (message.sender * 1 == myID) s = `
    <tr class="messageTR">
        <td class="messageContentTD isent1 ">
            ${message.body}
        </td>

    </tr>`
    else s = `
    <tr class="messageTR">
        <td class="messageContentTD usent ">
            ${message.body}
        </td>
    </tr>`
    var root = getel('messagebox');
    root.innerHTML += s;
}


function mesgListItm(message) {

    var me = myID * 1;
    var notMe = message.reciever * 1 + message.sender * 1 - me;
    if (availableUsers[notMe] == null) {
        getData(`/findUsr/${notMe}`, function (dt) {
            var root = getel('messageList')
            var othername = dt.data.uname;
            var s = `
            <div class="mesgListItm" id="listItem${notMe}" onclick="chatWith(${notMe})">
                <img src="${dt.data.propic}" alt="" class="userpropic">

                    <b class="name" id="name${notMe}"><i><u>${othername}:</u></i></b>
                    <div class="d-flex" id="messgbd${notMe}">
                        <b class="senda"><i><u>${message.sender * 1 == myID ? 'you' : othername}:</u></i></b>
                    <p class="message">${message.body}</p>
                </div>
            </div>
            `
            root.innerHTML = s + root.innerHTML;
            availableUsers[notMe] = dt.data
        })

    }
    else {
        var root = getel('messageList')
        var othername = availableUsers[notMe].uname
        var s = `
            <div class="mesgListItm" id="listItem${notMe}" onclick="chatWith(${notMe})">
                    <div class="d-flex">
                        <img src="${availableUsers[notMe].propic}" alt="" class="userpropic">
                        <div>
                            <b class="name" id="name${notMe}"><i><u>${othername}:</u></i></b>
                            <div class="d-flex" id="messgbd${notMe}">
                                <b class="senda"><i><u>${message.sender * 1 == myID ? 'you' : othername}:</u></i></b>
                            <p class="message">${message.body}</p>
                        </div>
                    </div>
                    
                </div>
            </div>
            `
        root.innerHTML = s + root.innerHTML;
    }
}

function getMyLastms() {
    getData('/getMyLstm', (mss) => {
        getel('waitPls').innerHTML = ''
        if (mss.data.length) {
            rendermessages(0, mss.data)
        }
        //
    })

}

function rendermessages(index, data) {
    if (index < data.length) {
        if (!data[index].typ) {

            mesgListItm(data[index])
        }
        else {
            renderGroupMessageListItem(data[index])
        }
        rendermessages(index + 1, data)
    }
}

function renderGroupMessageListItem(message) {
    if (mygroups[message.reciever] == null) {
        getData('/getGroupDet/' + message.reciever, (res) => {

            mygroups[message.reciever] = res.data;
            if (availableUsers[message.sender] == null) {
                getData(`/findUsr/${message.sender}`, (dt) => {
                    availableUsers[message.sender] = dt.data
                    var notMe = message.reciever;
                    var s = `
                    <div class="mesgListItm" id="grupItem${notMe}" onclick="groupChatWith(${notMe},1)">
                        <b class="name" id="GroupName${notMe}"><i><u>${res.data.groupname}:</u></i></b>
                        <div class="d-flex" id="messgbd${notMe}">
                            <b class="senda"><i><u>${message.sender * 1 == myID ? 'you' : dt.data.uname}:</u></i></b>
                            <p class="message">${message.body}</p>
                        </div>
                    </div>
                    `

                    var root = getel('groupList')
                    for (let n = 0; n < root.childNodes.length; n++) {
                        if (root.childNodes[n].id == `grupItem${notMe}`)
                            root.removeChild(root.childNodes[n])
                    }
                    root.innerHTML = s + root.innerHTML
                })

            }
            else {
                var notMe = message.reciever;
                var s = `
                    <div class="mesgListItm" id="grupItem${notMe}" onclick="groupChatWith(${notMe},1)">
                        <b class="name" id="GroupName${notMe}"><i><u>${res.data.groupname}:</u></i></b>
                        <div class="d-flex" id="messgbd${notMe}">
                            <b class="senda"><i><u>${message.sender * 1 == myID ? 'you' : availableUsers[message.sender].uname}:</u></i></b>
                            <p class="message">${message.body}</p>
                        </div>
                    </div>
                    `

                var root = getel('groupList')
                for (let n = 0; n < root.childNodes.length; n++) {
                    if (root.childNodes[n].id == `grupItem${notMe}`)
                        root.removeChild(root.childNodes[n])
                }
                root.innerHTML = s + root.innerHTML
            }
        })

    }
    else {
        if (availableUsers[message.sender] == null) {
            getData(`/findUsr/${message.sender}`, (dt) => {
                availableUsers[message.sender] = dt.data
                var notMe = message.reciever;
                var s = `
            <div class="mesgListItm" id="grupItem${notMe}" onclick="groupChatWith(${notMe},1)">
                <b class="name" id="GroupName${notMe}"><i><u>${mygroups[message.reciever].groupname}:</u></i></b>
                <div class="d-flex" id="messgbd${notMe}">
                    <b class="senda"><i><u>${message.sender * 1 == myID ? 'you' : dt.data.uname}:</u></i></b>
                    <p class="message">${message.body}</p>
                </div>
            </div>
            `

                var root = getel('groupList')
                for (let n = 0; n < root.childNodes.length; n++) {
                    if (root.childNodes[n].id == `grupItem${notMe}`)
                        root.removeChild(root.childNodes[n])
                }
                root.innerHTML = s + root.innerHTML
            })

        }
        else {
            var notMe = message.reciever;
            var s = `
            <div class="mesgListItm" id="grupItem${notMe}" onclick="groupChatWith(${notMe},1)">
                <b class="name" id="GroupName${notMe}"><i><u>${mygroups[message.reciever].groupname}:</u></i></b>
                <div class="d-flex" id="messgbd${notMe}">
                    <b class="senda"><i><u>${message.sender * 1 == myID ? 'you' : availableUsers[message.sender].uname}:</u></i></b>
                    <p class="message">${message.body}</p>
                </div>
            </div>
            `

            var root = getel('groupList')
            for (let n = 0; n < root.childNodes.length; n++) {
                if (root.childNodes[n].id == `grupItem${notMe}`)
                    root.removeChild(root.childNodes[n])
            }
            root.innerHTML = s + root.innerHTML
        }
    }
}

getel('send').onclick = (e) => {
    e.preventDefault()
    sendMessageTo(currentlyActive)
}

var currentlyActiveTyp = -1


function sendMessageTo(id) {
    var data = {
        sender: myID,
        reciever: id,
        body: getel('inputm').value,
        typ: currentlyActiveTyp
    }
    getel('inputm').value = ''
    // needs to be changed

    if (!currentlyActiveTyp) {
        socket.emit('sendms', data)
        var messageList = getel('messageList')
        for (let n = 0; n < messageList.childNodes.length; n++) {
            if (messageList.childNodes[n].id == `listItem${id}`) {
                messageList.removeChild(messageList.childNodes[n]);
                break
            }
        }
        mesgListItm(data)
        messageTR(data);
    }
    else {
        if (mygroups[id] == null) {
            getData('/getGroupDet/' + id, (dt) => {
                mygroups[id] = dt.data;
                data['sendername'] = myName;
                data['roomName'] = dt.data.groupname;
                data['originalName'] = dt.data.originalName;;
                data['propic'] = myproPic
                socket.emit('new_group_message', dt.data.originalName, data)
                var groupList = getel('groupList')
                for (let n = 0; n < groupList.childNodes.length; n++) {
                    if (groupList.childNodes[n].id == `grupItem${id}`) {
                        groupList.removeChild(groupList.childNodes[n]);
                        break
                    }
                }
                renderGroupMessageListItemRealTime(data);
                groupMessageTrRealTime(data);
                focs('messageTR')
                savenewmessageGroup(data)
            })

        }

        else {
            data['sendername'] = myName;
            data['roomName'] = mygroups[id].groupname;
            data['originalName'] = mygroups[id].originalName;
            data['propic'] = myproPic
            socket.emit('new_group_message', mygroups[id].originalName, data)
            var groupList = getel('groupList')
            for (let n = 0; n < groupList.childNodes.length; n++) {
                if (groupList.childNodes[n].id == `grupItem${id}`) {
                    groupList.removeChild(groupList.childNodes[n]);
                    break
                }
            }
            renderGroupMessageListItemRealTime(data);
            groupMessageTrRealTime(data);
            focs('messageTR')
            savenewmessageGroup(data)
        }
    }
}





function renderGroupMessageListItemRealTime(message) {
    var notMe = message.reciever;
    var s = `
    <div class="mesgListItm" id="grupItem${notMe}" onclick="groupChatWith(${notMe},1)">
        <b class="name" id="GroupName${notMe}"><i><u>${message.roomName}:</u></i></b>
        <div class="d-flex" id="messgbd${notMe}">
            <b class="senda"><i><u>${message.sender * 1 == myID ? 'you' : message.sendername}:</u></i></b>
            <p class="message">${message.body}</p>
        </div>
    </div>
                    `

    var root = getel('groupList')
    for (let n = 0; n < root.childNodes.length; n++) {
        if (root.childNodes[n].id == `grupItem${notMe}`)
            root.removeChild(root.childNodes[n])
    }
    root.innerHTML = s + root.innerHTML
}

function groupMessageTrRealTime(message) {
    if (availableUsers[message.sender] == null) {
        getData('/findUsr/' + message.sender, (resp) => {
            availableUsers[message.sender] = resp.data;
            var s = ''
            if (message.sender != myID) {
                s = `
        <tr class="messageTR d-flex uwrote">
            <td>
                <img src="${availableUsers[message.sender].propic}" alt="" class="userpropic ">
            </td>
            <td class="messageContentTD usent dropup">        
                ${message.body}        
            </td>
        </tr>`;
            }

            else {

                s = `
                <tr class="messageTR iwrote d-flex justify-content-end">
                    <td class="messageContentTD isent">
                        ${message.body}</td>
                    <td>
                    <img src="${availableUsers[message.sender].propic}" alt="" class="userpropic ">
                    </td>
                </tr>`;
            }

            var root = getel('messagebox');
            root.innerHTML += s;
            focs('messageTR')
        })

    }
    else {
        var s = ''
        if (message.sender != myID) {
            s = `
        <tr class="messageTR d-flex uwrote">
            <td>
                <img src="${availableUsers[message.sender].propic}" alt="" class="userpropic ">
            </td>
            <td class="messageContentTD usent dropup">        
                ${message.body}        
            </td>
        </tr>`;
        }

        else {

            s = `
                <tr class="messageTR iwrote d-flex justify-content-end">
                    <td class="messageContentTD isent">
                        ${message.body}</td>
                    <td>
                    <img src="${availableUsers[message.sender].propic}" alt="" class="userpropic ">
                    </td>
                </tr>`;
        }

        var root = getel('messagebox');
        root.innerHTML += s;
        focs('messageTR')
    }

}


socket.on('messageaise', (data) => {
    if (currentlyActive != data.sender * 1) getel('menubar').style.color = 'red'
    var notMe = data.sender + data.reciever * 1 - myID
    if (!data.typ) {

        for (let n = 0; n < getel('messageList').childNodes.length; n++) {
            if (getel('messageList').childNodes[n].id == `listItem${notMe}`) {
                getel('messageList').removeChild(getel('messageList').childNodes[n])
            }
        }
        mesgListItm(data)
        if (data.sender == currentlyActive) {
            messageTR(data)
        }
        focs('messageTR')
    }
    else {
        try {
            getel('groupList').removeChild(getel(`grupItem${data.reciever}`))
        } catch (error) {
        }
        renderGroupMessageListItem(data)
        if (data.reciever == currentlyActive) {
            groupMessageTr(data);
            focs('messageTR')
        }
    }

})

socket.on('newUser', (user) => {
    otherGuy(user, othersRoot)
})

getel('newMsgBtn').onclick = () => {
    getel('notAddedFriendsRoot0').innerHTML = ''
    getel('addedfriendsRoot0').innerHTML = ''
    getData('/myfriends', (resp) => {
        for (let n = 0; n < resp.data.length; n++) {
            availableUsers[resp.data[n].ID] = resp.data[n];
            renderNotAddedroot(resp.data[n], '0')
        }
        $('#newgroupmodal').modal({ show: true })
    })

}

var taken = {}

function renderNotAddedroot(friend, typ) {
    var root = getel('notAddedFriendsRoot' + typ)
    var s = `
    <div class="d-flex" id="notAddedfriend${friend.ID}">
        <img src="${availableUsers[friend.ID].propic}" alt="" class="userpropic">

        <div id="notAddedFriendName${friend.ID}" class="notaddedname">
            ${friend.uname}
        </div> 
        <div class="notAddedBtn" onclick="addTolist(${friend.ID},'${friend.uname}',${typ})">add</div>
    </div>
    `
    root.innerHTML += s
}

getel('doneAddingBtn').onclick = () => {
    var tot = []
    for (let n in taken) {
        if (taken[n]) tot.push({
            "ID": n,
            "uname": taken[n]
        })
    }
    doneAddingMore(0, tot)
}
function doneAddingMore(index, tkn) {
    postData('/insertmember', { group: currentlyActive, memberr: tkn[index].ID }, (resp) => {
        var message = {
            sender: myID,
            reciever: currentlyActive,
            typ: 1,
            body: `${myName} added ${availableUsers[tkn[index].ID].uname} to the group`,
            roomName: mygroups[currentlyActive].groupname,
            sendername: myName,
            originalName: mygroups[currentlyActive].originalName,
            propic: myproPic
        }
        socket.emit('user_added', {
            groupID: currentlyActive,
            groupname: mygroups[currentlyActive].groupname,
            originalName: mygroups[currentlyActive].originalName,
            owner: myName,
            ownerID: myID,
            reciever: tkn[index].ID
        })
        renderGroupMessageListItemRealTime(message)
        groupMessageTrRealTime(message)
        socket.emit('new_group_message', mygroups[currentlyActive].originalName, message)
        savenewmessageGroup(message)

    })

}

function addTolist(ID, uname, typ) {
    var root = getel('notAddedFriendsRoot' + typ)
    root.removeChild(getel(`notAddedfriend${ID}`))
    renderAdded({ uname: uname, ID: ID }, typ)
    taken[ID] = uname
}

function renderAdded(friend, typ) {

    var root = getel('addedfriendsRoot' + typ)
    var s = `
    <div class="d-flex addedFriendDIV" id="Addedfriend${friend.ID}">
        <img src="${availableUsers[friend.ID].propic}" alt="" class="userpropic">

        <div id="AddedFriendName${friend.ID}" class="addedname">
            <h3 class="addedfrNmae">${friend.uname}</h3>
            <div class="removeBTN" onclick="removefromList(${friend.ID},'${friend.uname}','${typ}')">x</div>
        </div> 
        
    </div>
    `
    root.innerHTML += s
}

function removefromList(ID, uname, typ) {
    var root = getel('addedfriendsRoot' + typ)
    root.removeChild(getel(`Addedfriend${ID}`))
    taken[ID] = uname;
    taken[ID] = 0
    renderNotAddedroot({ uname: uname, ID: ID }, typ)
}

getel('doneCreatingBtn').onclick = () => {
    var tot = []
    for (let n in taken) {
        if (taken[n]) tot.push({
            "ID": n,
            "uname": taken[n]
        })
    }
    if (tot.length) {
        tot.push({
            "ID": myID,
            "uname": myName
        })
        var groupnamex = getel('groupname').value + '';
        getData('/getGroupID', (rs) => {
            var id = rs.data * 1 + 1;
            var originalNamex = groupnamex + myName + id
            postData('/registerGroupx', {
                groupname: groupnamex,
                originalName: originalNamex,
                owner: myID * 1,
                ID: id
            }, (r) => {
                insertUsertoGroup(0, tot, id, groupnamex, myName, originalNamex, myID);
                mygroups[id] = {
                    groupname: groupnamex,
                    originalName: originalNamex,
                    owner: myID * 1,
                    ID: id
                }
            })

        })

    }
}

function insertUsertoGroup(index, ar, groupID, groupname, owner, originalName, ownerID) {
    if (index < ar.length) {
        var data = {
            group: groupID,
            memberr: ar[index].ID
        }
        postData("/insertmember", data, function (response) {
            socket.emit('user_added', {
                groupID: groupID,
                groupname: groupname,
                originalName: originalName,
                owner: owner,
                ownerID: ownerID,
                reciever: ar[index].ID
            })
            insertUsertoGroup(index + 1, ar, groupID, groupname, owner, originalName, ownerID)

        })

    }
    else {
        var message = {
            sender: myID,
            reciever: groupID,
            typ: 1,
            body: `you are added to ${groupname}`,
            roomName: groupname,
            originalName: originalName,
            sendername: myName,
            propic: myproPic
        }
        socket.emit('new_group_message', originalName, message)
        renderGroupMessageListItemRealTime(message)
        savenewmessageGroup(message)
    }
}

socket.on('u_r_added', (data) => {
    mygroups[data.groupID] = data;
    socket.emit('joined', data.originalName, myID);
    getData('/getlstmgp/' + data.groupID, (res) => {
        renderGroupMessageListItem(res.data)
    })
})





socket.on('got_a_group_message', (data) => {
    if (currentlyActive != data.reciever * 1) getel('menubar').style.color = 'red'
    renderGroupMessageListItemRealTime(data);
    if (currentlyActive == data.reciever && currentlyActiveTyp) {
        groupMessageTrRealTime(data)
    }
})

function chatWith(ID) {
    getel('headerRoot').innerHTML = ''
    var headerRoot = getel('headerRoot')
    getel('messageWithHeader').style.display = 'block'
    headerRoot.innerHTML = `
    <div id="chatwithFriend" class="container d-flex justify-content-between">
        <img src="${availableUsers[ID].propic}" alt="" class="userpropic">
        <h3 id="friendNameonHeader" class="headertxt">
        ${availableUsers[ID].uname}
        </h3>
        <div class="dropdown dropleft">
            <button id="my-dropdown" class="btn btn-primary dropdown-toggle" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">Optins</button>
            <div class="dropdown-menu" aria-labelledby="my-dropdown">
                <div class="dropdown-item" onclick="unfriend(${ID},${availableUsers[ID].uname},1,${availableUsers[ID].propic})">Unfriend</div>
                <div class="dropdown-item" onclick="call(0,${ID})">call</div>
            </div>
        </div>
    </div>
    `
    if (menubarStatus) {
        getel('sidebar').style.maxWidth = '0';
        getel('body').style.maxWidth = '100vw';
        menubarStatus ^= 1
    }

    currentlyActiveTyp = 0
    messageBar.style.display = 'block';
    currentlyActive = ID;
    $('#sidepageModal').modal('hide')
    getel('waitin').innerHTML = 'Loading...'
    getel('messagebox').innerHTML = ''
    getData(`/chatwith/${ID}`, (resp) => {
        for (let n = 0; n < resp.data.length; n++) {
            messageTR(resp.data[n])
            focs('messageTR')
        }
        focs('messageTR')
        getel('waitin').innerHTML = ''
    })

}
function groupChatWith(ID) {
    getel('messageWithHeader').style.display = 'block'
    if (menubarStatus) {
        getel('sidebar').style.maxWidth = '0';
        getel('body').style.maxWidth = '100vw';
        menubarStatus ^= 1
    }

    var headerRoot = getel('headerRoot')
    headerRoot.innerHTML = ''
    headerRoot.innerHTML = `
    <div id="groupMessageHeader" class="container d-flex justify-content-between">
    <h3 id="groupNameHeader" class="headertxt">${mygroups[ID].groupname}</h3>
    <div class="dropdown dropleft">
        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
            Options
        </button>
        <div class="dropdown-menu">
            
            <div class="dropdown-item">
                <div id="viewMembersBtn" onclick="viewMembersBtn()">
                    <button class="btn btn-primary">View members</button>
                </div>
            </div>
            <div class="dropdown-item">
                <div id="groupcallbtn" onclick="call(1,${ID})">
                    <button class="btn btn-primary">Start call</button>
                </div>
            </div>
            <div class="dropdown-item">
                <div id="addMembersBtn" onclick="addMore(${ID},'${mygroups[ID].groupname}')">
                    <button class="btn btn-primary">Add members</button>
                </div>
            </div>
            <div class="dropdown-item">
                <div id="leaveGroubBtn" onclick="leaveGroup(${ID})">
                    <button class="btn btn-danger">Leave group</button>
                </div>
            </div>
        </div>
    </div>
</div>
    `
    if (mygroups[ID] == null) {
        getData('/getGroupDet/' + ID, (dt) => {
            mygroups[ID] = dt.data;
            socket.emit('joined', dt.data.originalName, myID);
            if (menubarStatus) {
                getel('sidebar').style.maxWidth = '0';
                getel('body').style.maxWidth = '100vw'
            }
            currentlyActiveTyp = 1;
            messageBar.style.display = 'block';
            currentlyActive = ID;
            getel('waitin').innerHTML = 'Loading...'
            getel('messagebox').innerHTML = ''
            $('#sidepageModal').modal('hide')
            getData(`/getGroupChatWith/${ID}`, (resp) => {
                groupMessageTr(0, resp.data);
                getel('waitin').innerHTML = ''
                focs('messageTR')
            })

        })

    }
    else {
        socket.emit('joined', mygroups[ID].originalName, myID);
        if (menubarStatus) {
            getel('sidebar').style.maxWidth = '0';
            getel('body').style.maxWidth = '100vw'
        }
        currentlyActiveTyp = 1;
        messageBar.style.display = 'block';
        currentlyActive = ID;
        getel('waitin').innerHTML = 'Loading...'
        getel('messagebox').innerHTML = ''
        $('#sidepageModal').modal('hide')
        getData(`/getGroupChatWith/${ID}`, (resp) => {
            groupMessageTr(0, resp.data);
            getel('waitin').innerHTML = ''
            focs('messageTR')
        })

    }

}

function leaveGroup(id) {
    if (window.confirm('You sure?')) {
        postData('/removeMe', { group: currentlyActive }, (res) => {
            getel('headerRoot').innerHTML = `
                    <div id="noneRoot">
                        <h3 class="">Select a conversation</h3>
                    </div>
                `
            var root = getel('groupList')
            for (let n = 0; n < root.childNodes.length; n++) {
                if (root.childNodes[n].id == `grupItem${currentlyActive}`)
                    root.removeChild(root.childNodes[n])
            }
            var message = {
                sender: myID,
                reciever: currentlyActive,
                typ: 1,
                body: `${myName} left the group`,
                roomName: mygroups[currentlyActive].groupname,
                sendername: myName,
                originalName: mygroups[currentlyActive].originalName,
                propic: myproPic
            }
            socket.emit('new_group_message', mygroups[currentlyActive].originalName, message)
            socket.emit('leave', mygroups[currentlyActive].originalName)
            savenewmessageGroup(message)
            getel('messagebox').innerHTML = ''

        })

    }
}

function savenewmessageGroup(message) {
    postData('/saveNewMessage', message, (res) => {
        message['msid'] = res.data
        postData('/updatelstmGroup', message, (res) => {

        })

    })

}

function addMore(id, name) {
    taken = {}
    getel('groupNameTobeAdded').innerHTML = name
    getData('/getAllmembers/' + id, (resp) => {
        getData('/myfriends', (res) => {
            res.data.forEach(fr => {
                availableUsers[fr.ID] = fr;
                availableUsers[fr.ID]['relation'] = 1;
            })
            var vist = {}
            for (let n = 0; n < resp.data.length; n++) {
                vist[resp.data[n]] = 1
            }
            for (let n in availableUsers) {
                if (availableUsers[n].relation == 1 && vist[n] == null) {
                    renderNotAddedroot(availableUsers[n], '1')
                }
            }
            $('#addgroupmodal').modal({ show: true })
        })

    })

}

function groupMessageTr(index, messages) {
    if (index < messages.length) {
        var s = ``;
        var s = ''
        if (availableUsers[messages[index].sender] != null) {
            if (messages[index].sender != myID) {
                s = `
                <tr class="messageTR d-flex uwrote">
                    <td>
                    <img src="${availableUsers[messages[index].sender].propic}" alt="" class="userpropic ">
                    </td>
                    <td class="messageContentTD usent dropup">
                        
                        ${messages[index].body}
                        
                    </td>
                </tr>`;
            }

            else {
                s = `
                <tr class="messageTR iwrote">
                    <td class="messageContentTD isent d-flex">
                        ${messages[index].body}</td>
                    <td>
                    <img src="${availableUsers[messages[index].sender].propic}" alt="" class="userpropic ">
                    </td>
                </tr>`;
            }
            var root = getel('messagebox');
            root.innerHTML += s;
            groupMessageTr(index + 1, messages)
        }
        else {
            getData('/findUsr/' + messages[index].sender, (resp) => {
                availableUsers[messages[index].sender] = resp.data;
                if (messages[index].sender != myID) {
                    s = `
                <tr class="messageTR d-flex uwrote">
                    <td>
                    <img src="${availableUsers[messages[index].sender].propic}" alt="" class="userpropic ">
                    </td>
                    <td class="messageContentTD usent dropup">
                        
                        ${messages[index].body}
                        
                    </td>
                </tr>`;
                }

                else {
                    s = `
                        <tr class="messageTR iwrote d-flex justify-content-end">
                            <td class="messageContentTD isent ">
                                ${messages[index].body}</td>
                            <td>
                            <img src="${availableUsers[messages[index].sender].propic}" alt="" class="userpropic ">
                            </td>
                        </tr>`;
                }
                var root = getel('messagebox');
                root.innerHTML += s;
                groupMessageTr(index + 1, messages)
            })

        }
    }

}



function getAllgroupNames() {
    getData('/getAllMygrups', (res) => {
        registerOnthis(0, res.data)
    })

}

function registerOnthis(index, data) {

    if (index < data.length) {
        mygroups[data[index].ID] = data[index]
        socket.emit('joined', data[index].originalName, myID)
        registerOnthis(index + 1, data)
    }
}


function viewMembersBtn() {
    currentlyShowingType = 0;
    membersRoot.innerHTML = 'Loading...'
    getData('/getAllmembers/' + currentlyActive, (res) => {
        getel('membersRoot').innerHTML = ''
        renderRelationship(0, res.data)

        $('#showMembersModal').modal({ show: true })

    })

}



function renderRelationship(index, s) {
    if (index < s.length) {

        if (s[index] != myID) { /* */
            if (availableUsers[s[index]] == null) {
                getData('/findUsr', (dt) => {
                    availableUsers[s[index]] = dt.data;
                    getData('/findRelation/' + s[index], (res) => {
                        availableUsers[s[index]].relation = res.data;
                        if (availableUsers[s[index]] == null) {

                        }
                        else {
                            try {
                                var user = availableUsers[s[index]]
                                if (res.data == 1) {
                                    myFriend(user, getel('membersRoot'), 0)
                                }
                                else if (res.data == 2) {
                                    renderMysentrqs(user, getel('membersRoot'), 0)
                                }
                                else if (res.data == 3) {
                                    requests(user, getel('membersRoot'), 0)
                                }
                                else {
                                    otherGuy(user, getel('membersRoot'), 0)
                                }
                                renderRelationship(index + 1, s)
                            } catch (error) {
                             }

                        }
                    })

                })

            }
            else if (availableUsers[s[index]].relation == null) {
                getData('/findRelation/' + s[index], (res) => {
                    availableUsers[s[index]].relation = res.data;
                    if (availableUsers[s[index]] == null) {

                    }
                    else {
                        try {
                            var user = availableUsers[s[index]]
                            if (res.data == 1) {
                                myFriend(user, getel('membersRoot'), 0)
                            }
                            else if (res.data == 2) {
                                renderMysentrqs(user, getel('membersRoot'), 0)
                            }
                            else if (res.data == 3) {
                                requests(user, getel('membersRoot'), 0)
                            }
                            else {
                                otherGuy(user, getel('membersRoot'), 0)
                            }
                            renderRelationship(index + 1, s)
                        } catch (error) {
                            alert('err')
                        }

                    }
                })

            }
            else {
                var user = availableUsers[s[index]];
                var relation = user.relation;
                if (relation == 1) {
                    myFriend(user, getel('membersRoot'), 0)
                }
                else if (relation == 2) {
                    renderMysentrqs(user, getel('membersRoot'), 0)
                }
                else if (relation == 3) {
                    requests(user, getel('membersRoot'), 0)
                }
                else {
                    otherGuy(user, getel('membersRoot'), 0)
                }
                renderRelationship(index + 1, s)
            }


        }
        else {
            renderRelationship(index + 1, s)
        }
    }

}

function call(typ, id) {
    getData('/getlink', (res) => {
        if (typ) {
            socket.emit('requestCall', mygroups[id].originalName, { data: res.data, from: myName })
        }
        else {
            socket.emit('callUser', { reciever: id, data: res.data, from: myName })
        }
        window.location.href = 'https://rltm.herokuapp.com/?room=' + res.data;

        //ad.pause()
    })

}

socket.on('newcall', (data) => {
    getel('phonecallheader').innerHTML = `${data.from} is inviting you to a video chat`;
    ad.play()
    getel('acceptCall').href = 'https://rltm.herokuapp.com/?room=' + data.url;
    $('#callmodal').modal({ show: true })
})