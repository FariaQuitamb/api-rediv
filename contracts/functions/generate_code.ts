const generateCode = (value: string) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  //var word = ''
  var numDigits = 13 - value.length
  for (let i = 0; i < numDigits; i++) {
    const random = alphabet[Math.floor(Math.random() * alphabet.length)]
    value += random
  }

  //console.log(value)

  return value
}

export default generateCode
