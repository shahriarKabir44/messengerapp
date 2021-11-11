const usr = require('../schemas/usr')
const mssg = require('../schemas/mesg')
const friends = require('../schemas/friends')
const reqs = require('../schemas/friendrqs')
const lastms = require('../schemas/lastmsg')
const cnts = require('../schemas/counter')
const group = require('../schemas/groupChat')
const members = require('../schemas/members')
const userz = require('../schemas/usr')
module.exports = (sockt) => {
    sockt.on('joined', (room, dt) => {
        sockt.join(room)
     })
    sockt.on('requestCall', (room, data) => {
        sockt.to(room).emit('newcall', { url: data.data, from: data.from })
    })
    sockt.on('callUser', (data) => {
        userz.findOne({ ID: data.reciever * 1 }, (er, dt) => {
            sockt.broadcast.to(dt.userpageID).emit('newcall', { url: data.data, from: data.from })
        })
    })
    sockt.on('leave', room => {
        sockt.leave(room)
    })
    sockt.on('userpageID', (dat) => {

        usr.findOne({ ID: dat.me }, (er, dt) => {
            if (er) throw er;
            else {
                if (dt.userpageID == null)
                    sockt.broadcast.emit('newUser', { ID: dt.ID, uname: dt.uname, propic: dt.propic })
                usr.findOneAndUpdate({ ID: dat.me }, { userpageID: sockt.id }, (erx, dt) => {
                    if (erx) throw erx;
                })
            }
        })
    })


    sockt.on('unfriended', (dat) => {
        var { sender, reciever } = dat;
        usr.findOne({ ID: reciever }, (er, dt) => {
            if (er) throw er;
            usr.findOne({ ID: sender }, (ee, user) => {
                if (dt.userpageID != null) sockt.broadcast.to(dt.userpageID).emit('friendremoved', { ID: user.ID, uname: user.uname, type: 1, propic: user.propic })
            })
        })
    })

    sockt.on('accepted', (dat) => {
        var { sender, reciever } = dat;
        usr.findOne({ ID: reciever }, (er, dt) => {
            if (er) throw er;
            usr.findOne({ ID: sender }, (ee, user) => {
                if (dt.userpageID != null) sockt.broadcast.to(dt.userpageID).emit('friendReqAccepted', { ID: user.ID, uname: user.uname, type: 1, propic: user.propic })
            })
        })
    })

    sockt.on('rejected', (data) => {
        var { sender, reciever } = data;
        usr.findOne({ ID: reciever }, (e, rejectedUser) => {
            rejectedUser.pwd = null;
            usr.findOne({ ID: sender }, (er, rejector) => {
                rejector.pwd = null;
                sockt.broadcast.to(rejectedUser.userpageID).emit('requestRejected', { ID: rejector.ID, uname: rejector.uname, propic: rejector.propic })
            })
        })
    })



    sockt.on('sentfriendreq', (dat) => {
        var { sender, reciever } = dat;
        usr.findOne({ ID: reciever }, (er, dt) => {
            if (er) throw er;
            usr.findOne({ ID: sender }, (ee, user) => {
                if (dt.userpageID != null) sockt.broadcast.to(dt.userpageID).emit('recievedReq', { ID: user.ID, uname: user.uname, propic: user.propic })
            })
        })
    })
    sockt.on('cancelledReqs', (data) => {
        var { sender, reciever } = data;
        usr.findOne({ ID: reciever * 1 }, (e, dt) => {
            usr.findOne({ ID: sender }, (er, clint) => {
                sockt.broadcast.to(dt.userpageID).emit('requestRemoved', { ID: clint.ID, uname: clint.uname, propic: clint.propic });
            })
        })
    })
    sockt.on('sendms', (dat) => {
        var { sender, reciever, body, typ } = dat;
        cnts.findById('cc', (q, sm) => {
            var nmb = sm.mesg;
            var x = new mssg({
                sender: sender * 1,
                reciever: reciever * 1,
                body: body,
                ID: nmb,
                typ: typ
            })
            x.save((er) => {
                if (er) throw er;
                else {
                    usr.findOne({ ID: sender * 1 }, (err, rws) => {
                        if (err) throw err;
                        dat['uname2'] = rws.uname;
                        lastms.findOneAndDelete({
                            $and: [{ typ: typ }, {
                                $or: [{ $and: [{ sender: sender }, { reciever: reciever }] },
                                { $and: [{ sender: reciever }, { reciever: sender }] }]
                            }]
                        }, (er, dt) => {
                            if (er) throw er;
                            if (1) {
                                var j = new lastms({
                                    sender: sender,
                                    reciever: reciever,
                                    body: body,
                                    msid: nmb,
                                    typ: typ
                                })
                                j.save((ee) => {
                                    if (ee) throw ee;
                                    else {
                                        cnts.findByIdAndUpdate('cc', { mesg: nmb + 1 }, (ex, d) => {
                                            if (ex) throw ex;

                                        })
                                    }
                                })
                            }
                        })
                        if (!typ) {
                            usr.findOne({ ID: reciever }, (aaa, ppp) => {
                                sockt.broadcast.to(ppp.userpageID).emit('messageaise', dat)
                            })
                        }
                        else {
                            group.findOne({ ID: reciever * 1 }, (ex, ans) => {
                             })
                        }
                    })
                }
            })
        })


    })

    sockt.on('new_group_message', (room, data) => {
        sockt.to(room).emit('got_a_group_message', data)
    })

    sockt.on('user_added', (data) => {
        usr.findOne({ ID: data.reciever * 1 }, (er, d) => {
            sockt.broadcast.to(d.userpageID).emit('u_r_added', data)
        })
    })

}