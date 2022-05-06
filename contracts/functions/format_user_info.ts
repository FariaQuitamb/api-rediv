const formatUserInfo = (user: any) => {
  const userInfo = {
    id: user?.id,
    nome: user?.name,
    phone: user?.phone,
    bi: user?.bi,
    email: user?.email,
  }

  const data = JSON.stringify(userInfo)
  return data
}

export default formatUserInfo
