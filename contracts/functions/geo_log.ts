import formatDeviceInfo from './format_device_info'
import regVaccinationLog from './reg_vaccination_log'

const geoLog = async (type, vaccinationId, request: any) => {
  const headers = request.headers()

  const fields = formatDeviceInfo(type, vaccinationId, headers)

  const data = await regVaccinationLog(fields)
  return data
}

export default geoLog
