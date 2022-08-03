const getUserRank = (arr: any, userId: number) => {
  let position = 0

  arr.some(function (userRank, index) {
    if (userRank.Id_userPostoVacinacao === userId) {
      position = index + 1

      return true
    }
  })

  return position
}

export default getUserRank
