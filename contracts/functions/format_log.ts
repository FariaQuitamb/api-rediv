const formatHeaders = (vaccinationId, phone, headers: any) => {
  const data = {
    vaccinationId: vaccinationId,
    imei: `mac:${headers['x-application-latitude']}`,
    phone: phone ?? 'xxx-xxx-xxx',
    latitude: `${headers['x-application-latitude']}`,
    longitude: `${headers['x-application-longitude']}`,
  }
  return data
}

export default formatHeaders
