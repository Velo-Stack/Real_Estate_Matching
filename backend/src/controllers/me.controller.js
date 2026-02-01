const prisma = require('../utils/prisma');

const getMyTeam = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's team membership
        const membership = await prisma.teamMember.findFirst({
            where: { userId },
            include: {
                team: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true, role: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!membership) {
            return res.json({ team: null, manager: null, members: [] });
        }

        const team = membership.team;

        // Find manager (team role = MANAGER)
        const managerMembership = team.members.find(m => m.role === 'MANAGER');
        const manager = managerMembership?.user || null;

        // All members
        const members = team.members.map(m => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            role: m.user.role,
            teamRole: m.role
        }));

        res.json({
            team: {
                id: team.id,
                name: team.name,
                type: team.type
            },
            manager,
            members,
            myRole: membership.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMyTeam };
