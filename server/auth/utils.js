const reduceUser = (user, getElevatedStatuses = false) => {
    const simplifiedUser = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
        isAdmin: Boolean(process.env.OWNER_ID && user.id === process.env.OWNER_ID)
    };

    if (getElevatedStatuses) {
        simplifiedUser.isSoundboardUser = user.isSoundboardUser;
        simplifiedUser.isPlanetExpressMember = user.isPlanetExpressMember;
    }

    return simplifiedUser;
}

module.exports = {
    reduceUser
}