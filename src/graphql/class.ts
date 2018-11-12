/* CREATE CLASS */

/*
export const addClass = (token: string, grade: string, name: string) => {
  const teacher = await Teacher.findOne({ userID: user._id }).exec()
  const formattedTeacher = formatTeacher(teacher)

  const classes = await Class.find({ _id: { $in: teacher.classIDs } }).exec()
  const formattedClasses = await formatClasses(classes)

  const response = {
    ...formattedTeacher,
    classes: formattedClasses,
    user: formattedUser
  }

  console.log(response)

  return response
}
*/

/* UPDATE CLASS */
export const updateClass = () => {
  return
}