const formatHeaders = (vaccinationId, phone, headers: any) => {
  const data = {
    vaccinationId: vaccinationId,
    imei: 'mac:',
    phone: phone,

    latitude: `${headers['x-application-latitude']}`,
    longitude: `${headers['x-application-longitude']}`,
  }
  return data
}

export default formatHeaders
