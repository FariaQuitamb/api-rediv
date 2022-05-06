import formatDeviceInfo from './format_device_info'
import regVaccinationLog from './reg_vaccination_log'

const geoLog = async (type, vaccinationId, phone, request: any) => {
  const headers = request.headers()
  const fields = formatDeviceInfo(type, vaccinationId, phone, headers)
  const data = await regVaccinationLog(fields)
  return data
}

export default geoLog
