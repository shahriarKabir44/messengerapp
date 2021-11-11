const usr = require('../schemas/usr')
const mssg = require('../schemas/mesg')
const friends = require('../schemas/friends')
const reqs = require('../schemas/friendrqs')
const lastms = require('../schemas/lastmsg')
const cnts = require('../schemas/counter')
const group = require('../schemas/groupChat')
const members = require('../schemas/members')
const userz = require('../schemas/usr')

module.exports = {
    "gelMyGroups": async function (x) {
        try {
            var dt = await members.aggregate([
                {
                    $match: {
                        $and: [{
                            member: x
                        }]
                    }
                },
                {
                    $lookup: {
                        from: "groups",
                        localField: "group",
                        foreignField: "ID",
                        as: "grup"
                    }
                },
                {
                    $project: {
                        originalName: "$grup.originalName",
                        ID: "$grup.ID",
                        groupname: "$grup.groupname"
                    }
                }

            ])
            for (let n = 0; n < dt.length; n++) {
                try {
                    dt[n].ID = dt[n].ID[0];
                    dt[n].originalName = dt[n].originalName[0]
                    dt[n].groupname = dt[n].groupname[0]
                } catch (ex) {

                }
            }
            return dt
        } catch (error) {
            throw error
        }
    }
}