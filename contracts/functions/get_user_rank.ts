const getUserRank = (arr: any, userId: number) => {
  let nationalPosition = 0

  arr.some(function (userRank, index) {
    if (userRank.Id_userPostoVacinacao === userId) {
      nationalPosition = index + 1

      return true
    }
  })

  return nationalPosition
}

export default getUserRank
