const getGeoLocation = (headers: any) => {
  const data = {
    latitude: `${headers['x-application-latitude']}`,
    longitude: `${headers['x-application-longitude']}`,
  }
  return data
}

export default getGeoLocation
