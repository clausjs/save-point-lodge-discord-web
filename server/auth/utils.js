export const reduceUser = (user, getElevatedStatuses = false) => {
    const simplifiedUser = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl
    };

    if (getElevatedStatuses) {
        simplifiedUser.isSoundboardUser = user.isSoundboardUser;
        simplifiedUser.isPlanetExpressMember = user.isPlanetExpressMember;
    }

    return simplifiedUser;
}