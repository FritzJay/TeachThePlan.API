export const createUniqueUsernameForNewStudent = async (firstName, lastName, courseName, User) => {
  const formattedFirstName = firstName[0].toUpperCase() + firstName.slice(1, firstName.length).toLowerCase();
  const formattedLastInitial = lastName[0].toUpperCase();
  const count = await User.collection.countDocuments({ email: { $regex: `^${formattedFirstName}${formattedLastInitial}.*@${courseName}$`, $options: "i" } })
  if (count > 0) {
    return `${formattedFirstName}${formattedLastInitial}${count}@${courseName}`
  }
  return `${formattedFirstName}${formattedLastInitial}@${courseName}`
}