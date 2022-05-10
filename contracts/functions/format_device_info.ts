const formatDeviceInfo = (type, vaccinationId, headers: any) => {
  const data = {
    vaccinationId: vaccinationId,
    type: type,
    imei: `mac:${headers['x-application-latitude']}`,
    latitude: `${headers['x-application-latitude']}`,
    longitude: `${headers['x-application-longitude']}`,
  }
  return data
}

export default formatDeviceInfo
