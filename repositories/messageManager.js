const usr = require('../schemas/usr')
const mssg = require('../schemas/mesg')
const friends = require('../schemas/friends')
const reqs = require('../schemas/friendrqs')
const lastms = require('../schemas/lastmsg')
const cnts = require('../schemas/counter')
const group = require('../schemas/groupChat')
const members = require('../schemas/members')
const userz = require('../schemas/usr')
const userManager = require('./userManager')

module.exports = {
    "getAllPersonalMessages": async function (me, yu) {
        try {
            var relation = await userManager.findRelationWith(me, yu)
            if (relation == 1) {
                try {
                    var messages = await mssg.find({
                        $and: [
                            { typ: 0 },
                            {
                                $or:
                                    [{
                                        $and:
                                            [{ sender: me }, { reciever: yu }]
                                    },
                                    {
                                        $and:
                                            [{ sender: yu }, { reciever: me }]
                                    }]
                            }
                        ]
                    })
                    return messages
                } catch (error) {
                    throw error
                }
            }
            else return []
        } catch (error) {
            throw error
        }
    },
    "getMyLastMessages": async function (x) {
        try {
            var frs = await friends.find({ $or: [{ fr1: x }, { fr2: x }] })

            var mems = await lastms.find({ $or: [{ sender: x }, { reciever: x }] })
            var vis1 = {}
            for (let n = 0; n < frs.length; n++) {
                vis1[frs[n].fr1 + frs[n].fr2 - x] = 1
            }

            var grups = await members.aggregate([
                {
                    $match: {
                        $and: [
                            { member: x }
                        ]
                    }
                },
                {
                    $lookup: {
                        foreignField: "reciever",
                        localField: "group",
                        from: "lastmsgs",
                        as: "msg"
                    }
                },
                {
                    $project: {
                        sender: "$msg.sender",
                        reciever: "$msg.reciever",
                        body: "$msg.body",
                        typ: "$msg.typ"
                    }
                }
            ])


            var ans = []
            for (let n = 0; n < mems.length; n++) {
                if (vis1[mems[n].sender + mems[n].reciever - x] != null) {
                    ans.push(mems[n])
                }

            }
            for (let n = 0; n < grups.length; n++) {
                var v = { ...grups[n] };
                try {
                    var r = {
                        sender: v.sender[0],
                        reciever: v.reciever[0],
                        body: v.body[0],
                        typ: v.typ[0]
                    }
                    ans.push(r)
                } catch (error) {

                }


            }
            ans.sort((a, b) => {
                return a.msid - b.msid
            })
            return ans
        } catch (error) {
            throw error
        }
    }
}