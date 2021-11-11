var user = require('../schemas/usr')
var reqs = require('../schemas/friendrqs')
var friends = require('../schemas/friends')
module.exports = {
    "getMyFriendRequests": async function (me) {
        try {
            var dt = await reqs.aggregate([
                {
                    $match: {
                        $and: [{ reciever: me }]
                    }
                },
                {
                    $lookup: {
                        from: "userzs",
                        localField: "sender",
                        foreignField: "ID",
                        as: "uss"
                    }
                },
                {
                    $project: {
                        uname: "$uss.uname",
                        ID: "$uss.ID",
                        propic: "$uss.propic"
                    }
                }
            ])
            if (!dt.length) return 0;
            else {
                for (let n = 0; n < dt.length; n++) {
                    dt[n]['uname'] = dt[n].uname[0]
                    dt[n]['ID'] = dt[n].ID[0]
                    dt[n]['propic'] = dt[n].propic[0]
                }
                return dt
            }
        } catch (error) {
            throw error
        }

    },
    "getMyFriends": async function (me) {
        try {
            var dat = await friends.aggregate([
                {
                    $match: {
                        $or:
                            [{ fr1: me }, { fr2: me }]
                    }
                },
                {
                    $lookup: {
                        from: "userzs",
                        foreignField: "ID",
                        localField: "fr2",
                        as: "ff1"
                    }
                },
                {
                    $lookup: {
                        from: "userzs",
                        foreignField: "ID",
                        localField: "fr1",
                        as: "ff2"
                    }
                },
                {
                    $project: {
                        f1: "$ff1",
                        f2: "$ff2"
                    }
                }
            ])
            var ans = []
            vis = {}
            for (let n = 0; n < dat.length; n++) {
                if (dat[n] != null) {

                    if (dat[n].f1 != null && dat[n].f1[0].ID != me && vis[dat[n].f1[0].ID] == null) {
                        vis[dat[n].f1[0].ID] = 1;
                        dat[n].f1[0].pwd = null;
                        dat[n].f1[0].userpageID = null;
                        dat[n].f1[0]._id = null
                        ans.push(dat[n].f1[0])
                    }
                    if (dat[n].f1 != null && dat[n].f2[0].ID != me && vis[dat[n].f2[0].ID] == null) {
                        vis[dat[n].f2[0].ID] = 1;
                        dat[n].f2[0].pwd = null;
                        dat[n].f2[0].userpageID = null;
                        dat[n].f2[0]._id = null
                        ans.push(dat[n].f2[0])
                    }
                }
            }
            return ans
        } catch (error) {
            throw err;
        }

    },
    "getMyPendingRequests": async function (me) {
        try {
            var dt = await reqs.aggregate([
                {
                    $match: {
                        $and: [{ sender: me }]
                    }
                },
                {
                    $lookup: {
                        from: "userzs",
                        foreignField: "ID",
                        localField: "reciever",
                        as: "pers"
                    }
                },
                {
                    $project: {
                        ID: "$pers.ID",
                        uname: "$pers.uname",
                        propic: "$pers.propic"
                    }
                }
            ])
            if (dt.length == 0) {
                return ({ data: [] })
            }
            else {
                for (let n = 0; n < dt.length; n++) {
                    dt[n].ID = dt[n].ID[0];
                    dt[n].uname = dt[n].uname[0];
                    dt[n].propic = dt[n].propic[0]
                }
                return dt
            }
        } catch (error) {
            throw error;
        }





    },
    "findRelationWith": async function (me, u) {
        try {
            var ff = await friends.findOne({
                $or: [
                    {
                        $and: [
                            { fr1: me },
                            { fr2: u }
                        ]
                    },
                    {
                        $and: [
                            { fr2: me },
                            { fr1: u }
                        ]
                    }
                ]
            })
            if (ff != null) return 1
            else {
                var rq = await reqs.findOne({
                    $and: [
                        {
                            sender: me
                        },
                        { reciever: u }
                    ]
                })
                if (rq != null) return 2
                else {
                    rq = await reqs.findOne({
                        $and: [
                            {
                                sender: u
                            },
                            { reciever: me }
                        ]
                    })
                    if (rq != null) return 3
                    else {
                        return 4
                    }
                }
            }
        } catch (error) {
            throw error
        }
    }
}