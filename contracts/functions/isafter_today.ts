import moment from 'moment'

const isAfterToday = (date: any) => {
  const today = moment()
  let isAfterToday = false

  isAfterToday = moment(date).isAfter(today)

  return isAfterToday
}

export default isAfterToday
