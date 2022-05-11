const formatDeviceInfo = (type, vaccinationId, headers: any) => {
  const data = {
    vaccinationId: vaccinationId,
    type: type,
    mac: `${headers['x-application-mac']}`,
    latitude: `${headers['x-application-latitude']}`,
    longitude: `${headers['x-application-longitude']}`,
  }
  return data
}

export default formatDeviceInfo
