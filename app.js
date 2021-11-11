var express = require('express')
var app = express()
var srvr = require('http').createServer(app)
const session = require('express-session')

var userManager = require('./repositories/userManager')
var jwt = require('jsonwebtoken')
var secret = 'rerunerernun344n43ij0qjh(H(HE&iub2323n9h932923'
app.use(express.json());
const { v4: uuidv4, v4 } = require('uuid')
app.set('view engine', 'ejs')
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: false
    }
}));
app.use(express.static(__dirname + '/public'))

var io = require('socket.io')(srvr)
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://meme_lord:1234@cluster0.3sx7v.mongodb.net/chatapp?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })

// import all the uncle murphy
const usr = require('./schemas/usr')
const mssg = require('./schemas/mesg')
const friends = require('./schemas/friends')
const reqs = require('./schemas/friendrqs')
const lastms = require('./schemas/lastmsg')
const cnts = require('./schemas/counter')
const group = require('./schemas/groupChat')
const members = require('./schemas/members')
const userz = require('./schemas/usr')

var socketHandler = require('./repositories/socketHandlers')
const groupManager = require('./repositories/groupManager')
const messageManager = require('./repositories/messageManager')

function authToken(req, res, next) {
    var authHeader = req.headers['authorization']
    var token = authHeader && authHeader.split(' ')[1]
    if (!token) res.send({ data: 0 })
    else {
        jwt.verify(token, secret, (err, user) => {
            if (err) res.send({ data: 0 })
            else {
                req.user = user
                next()
            }
        })
    }
}
app.post('/sendFriendRequest', authToken, (req, res) => {
    var { reciever } = req.body;
    var x = new reqs({ sender: req.user.ID * 1, reciever: reciever });
    x.save((er) => {
        if (er) throw er;
        else res.send({ data: { me: req.user.ID * 1, yu: reciever } })
    })
})

app.post('/updlastms', (req, res) => {
    var { sender, reciever, body } = req.body;
    lastms.findOneAndUpdate({ $and: [{ sender: sender }, { reciever: reciever }] }, { body: body }, (er, dt) => {
        if (er) throw er;
        else res.send(dt)
    })
})

app.post('/createfriend', (req, res) => {
    var { fr1, fr2 } = req.body;
    var x = new friends({
        fr1: fr1 * 1,
        fr2: fr2 * 1
    });
    x.save((er) => {
        if (er) throw er;
        else res.send({ data: 1 })
    })
})
/**/



app.get('/myreqs', authToken, (req, res) => {
    var me = req.user.ID * 1
    userManager.getMyFriendRequests(me).then(data => {
        res.send({ data: data })
    })
})

app.get('/myfriends', authToken, (req, res) => {
    try {
        var me = req.user.ID * 1
        userManager.getMyFriends(me).then((data) => res.send({ data: data })).catch(er => {
            res.redirect('/')
        })
    } catch (error) {
        res.redirect('/')
    }
})

var PORT = process.env.PORT || 3000;
srvr.listen(PORT)
app.get('/', (req, res) => {
    var authHeader = req.headers['authorization']
    var token = authHeader && authHeader.split(' ')[1]
    if (!token) res.render('login.ejs')
    else {
        jwt.verify(token, secret, (err, user) => {
            if (err) res.render('login.ejs')
            else {
                req.user = user
                res.render('index.ejs', { me: req.user.ID, myname: req.user.uname, propic: req.user.propic })
            }
        })
    }

})

app.get('/home', (req, res) => {
    if (req.session.user == null) res.redirect('/')
    else {
        res.render('index.ejs', { me: req.session.user.ID, myname: req.session.user.uname, propic: req.session.user.propic })
    }
})
app.get('/logout', (req, res) => {
    req.user = null;
    req.header = null
    res.redirect('/')
})



app.post('/login', (req, res) => {
    var { un, pw } = req.body
    usr.find({ $and: [{ uname: un }, { pwd: pw }] }, (er, rws) => {
        if (!rws.length) res.send({ data: 0 })
        else {
            req.user = rws[0];
            req.session.user = { uname: rws[0].uname, ID: rws[0].ID, propic: rws[0].propic }
            var authHeader = jwt.sign({ uname: rws[0].uname, ID: rws[0].ID, propic: rws[0].propic }, secret)
            res.send({ data: authHeader })
        }
    })
})

app.get('/mysentrqsts', authToken, (req, res) => {
    if (req.user == null) res.redirect('/')
    var me = req.user.ID * 1;
    reqs.find({ sender: me }, (er, dt) => {
        if (er) throw er;
        else {
            res.send({ data: dt })
        }
    })
})

app.get('/mypending', authToken, (req, res) => {
    if (req.user == null) res.redirect('/')
    var me = req.user.ID * 1;
    userManager.getMyPendingRequests(me).then(data => res.send({ data: data })).catch(er => console.log('oops!'))
})

app.get('/frdreqs', authToken, (req, res) => {
    var me = req.user.ID * 1;
    reqs.find({ reciever: me }, (er, dt) => {
        if (er) throw er;
        else {
            res.send({ data: dt })
        }
    })
})

app.get('/everyone', authToken, (req, res) => {
    if (req.user == null) res.redirect('/')
    var me = req.user.ID * 1;
    usr.find({ $nor: [{ ID: me }] }, (er, dt) => {
        if (er) throw er;
        for (let n = 0; n < dt.length; n++)dt[n].pwd = null;
        res.send({ data: dt })
    })
})

app.get('/mybds', authToken, (req, res) => {
    if (req.user == null) res.redirect('/')
    var me = req.user.ID * 1;
    friends.find({ $or: [{ fr1: me }, { fr2: me }] }, (er, dt) => {
        if (er) throw er;
        res.send({ data: dt })
    })
})




app.post('/conf', authToken, (req, res) => {
    if (req.user == null) res.redirect('/')
    var me = req.user.ID;
    var { sender } = req.body
    reqs.findOneAndRemove({ $and: [{ reciever: me }, { sender: sender }] }, (er, dt) => {
        if (er) throw er;
        else {
            res.send({ stt: 1 })
        }
    })
})

app.post('/unfr', authToken, (req, res) => {
    if (req.user == null) res.redirect('/')
    var { ID } = req.body;
    var me = req.user.ID * 1;
    var id = ID * 1;
    friends.findOneAndDelete({ $or: [{ $and: [{ fr1: me }, { fr2: id }] }, { $and: [{ fr2: me }, { fr1: id }] }] }, (er, dt) => {
        if (er) throw er;
        else {
            res.send({ data: me })
        }
    })
})

app.post('/signUp', (req, res) => {
    var { unm, pwd } = req.body;
    cnts.findById('cc', (ee, x) => {
        var us = x.usr;
        var newUser = new usr({
            ID: us + 1,
            uname: unm,
            pwd: pwd,
            userpageID: null,
            messagepageID: null,
            propic: null
        })
        newUser.save((err) => {
            if (err) res.send({ data: 0 })
            else {
                cnts.findByIdAndUpdate('cc', { usr: us + 1 }, (er, f) => {
                    res.send({ data: us + 1 })
                })
            }
        })
    })

})

io.on('connection', (sockt) => { socketHandler(sockt) })



app.get('/getMyLstm', authToken, async (req, res) => {
    if (req.user == null) res.redirect('/')
    else {
        var x = req.user.ID;
        messageManager.getMyLastMessages(x).then(data => res.send({ data: data }))
    }

})

app.get('/findUsr/:id', authToken, (req, res) => {
    usr.findOne({ ID: req.params.id * 1 }, (er, dr) => {
        if (dr == null) res.send({ data: { uname: null, ID: null } })
        else res.send({ data: { uname: dr.uname, ID: dr.ID, propic: dr.propic } })
    })
})

app.post('/delrq', authToken, (req, res) => {
    var { reciever } = req.body;
    var me = req.user.ID;
    reqs.findOneAndDelete({ $and: [{ sender: me }, { reciever: reciever * 1 }] }, (er, dt) => {
        if (er) throw er;
        else res.send({ me: -1 })
    })
})

app.get('/getGroupID', authToken, (req, res) => {
    cnts.findById('cc', (er, dt) => {
        if (er) throw er;
        else res.send({ data: dt.groups })
    })
})

app.post('/registerGroupx', authToken, async (req, res) => {
    var { groupname, owner, originalName, ID } = req.body;
    var x = new group({
        groupname: groupname,
        owner: owner,
        originalName: originalName,
        ID: ID
    })
    /**/
    await cnts.findByIdAndUpdate('cc', { groups: ID })
    x.save((er) => {
        if (er) throw er;
        else {

            res.send({ data: 1 })
        }
    })
})

app.post('/insertmember', authToken, (req, res) => {
    var { group, memberr } = req.body;
    var x = new members({
        group: group,
        member: memberr
    })
    x.save((er) => {
        if (er) throw er;
        else res.send({ data: 1 })
    })
})

app.get('/getGroupDet/:id', authToken, (req, res) => {
    group.findOne({ ID: req.params.id * 1 }, (er, dt) => {
        if (er) throw er;
        else {
            res.send({ data: dt })
        }
    })
})

app.post('/saveNewMessage', authToken, async (req, res) => {
    var { sender, reciever, typ, body } = req.body
    var x = await cnts.findById('cc')
    var id = x.mesg + 1
    var s = new mssg({
        ID: id,
        sender: sender,
        reciever: reciever,
        typ: 1,
        body: body
    })
    await cnts.findByIdAndUpdate('cc', { mesg: id })
    s.save((er) => {
        if (er) throw er;
        else {
            res.send({ data: id })
        }
    })
})

app.post('/updatelstmGroup', authToken, async (req, res) => {
    var { msid, sender, reciever, typ, body } = req.body;
    await lastms.findOneAndDelete({
        $and: [
            { typ: typ },
            { reciever: reciever }
        ]
    })
    var x = new lastms({
        sender: sender,
        reciever: reciever,
        body: body,
        msid: msid,
        typ: typ
    })
    x.save((er) => {
        if (er) throw er;
        else res.send({ data: '1' })
    })
})

app.get('/chatwith/:id', authToken, (req, res) => {
    if (req.user == null) {
        res.redirect('/')
    }
    else {
        var me = req.user.ID * 1;
        var yu = req.params.id * 1
        messageManager.getAllPersonalMessages(me, yu).then(data => {
            res.send({ data: data })
        })
    }

})

app.get('/getGroupChatWith/:id', authToken, (req, res) => {
    if (req.user == null) {
        res.redirect('/')
    }
    else {
        var me = req.user.ID * 1;
        var yu = req.params.id * 1
        members.findOne({
            $and: [{
                group: yu,
                member: me
            }]
        }, (rrr, fr) => {
            if (rrr) throw rrr;
            if (fr == null) res.redirect('/');
            else {
                mssg.find({
                    $and: [
                        { typ: 1 },
                        { reciever: yu }
                    ]
                }, (er, dat) => {
                    if (er) throw er;
                    else {
                        res.send({ data: dat })
                    }
                })
            }
        })
    }
})


app.get('/getAllMygrups', authToken, (req, res) => {
    groupManager.gelMyGroups(req.user.ID).then(data => res.send({ data: data })).catch(er => {
        res.redirect('/')
    })
})

app.get('/getAllmembers/:id', authToken, (req, res) => {
    try {
        var me = req.user.ID;
        members.find({ group: req.params.id * 1 }, (er, dt) => {
            var ans = []
            for (let n = 0; n < dt.length; n++) {
                ans.push(dt[n].member)
            }
            res.send({ data: ans })
        })
    } catch (error) {
        res.redirect('/')
    }
})


app.get('/findRelation/:id', authToken, async (req, res) => {
    var me = req.user.ID
    var u = req.params.id * 1
    userManager.findRelationWith(me, u).then(data => { res.send({ data: data }) }).catch(er => { throw er })
})

app.post('/setPropic', (req, res) => {
    var { propic, ID } = req.body;
    userz.findOneAndUpdate({ ID: ID }, { propic: propic }, (er, dt) => {

        res.send({ data: ID })
    })
})

app.post('/removeMe', authToken, (req, res) => {
    try {
        var me = req.user.ID * 1
        var { group } = req.body;
        members.findOneAndRemove({ $and: [{ member: me }, { group: group }] }, (er, dt) => {
            if (er) throw er;
            else res.send({ data: '1' })
        })
    } catch (error) {

    }
})

app.get('/getlink', authToken, (req, res) => {
    res.send({ data: v4() })
})

app.get('/getlstmgp/:id', authToken, async (req, res) => {
    try {
        var me = req.user.ID;
        var gp = req.params.id * 1
        var mem = await members.findOne({ $and: [{ group: gp }, { member: me }] })
        if (mem == null) {
            res.redirect('/')
        }
        else {
            lastms.findOne({ $and: [{ reciever: gp }, { typ: 1 }] }, (er, dt) => {
                if (er) throw er;
                else res.send({ data: dt })
            })
        }
    } catch (error) {

    }
})
