import RegVaccinationLog from 'App/Models/RegVaccinationLog'

const regVaccinationLog = async (args: {
  vaccinationId: number
  imei: string
  latitude: string
  longitude: string
}) => {
  const log = await RegVaccinationLog.create(args)

  return log
}

export default regVaccinationLog
