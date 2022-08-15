import moment from 'moment'

const getEstimatedDate = (lastVaccineDate) => {
  const estimatedDate = moment(lastVaccineDate).startOf('day').add(16, 'd')
  const friendlyDate = estimatedDate.locale('pt').format('LLLL:ss').replace('00:00:00', '')
  const daysTillVaccine = estimatedDate.startOf('day').diff(moment().startOf('day'), 'days')

  return { daysTillVaccine, friendlyDate }
}

export default getEstimatedDate
