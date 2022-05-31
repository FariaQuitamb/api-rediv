const deviceInfo = (headers: any) => {
  const data = {
    mac: `${headers['x-application-mac']}`,
    latitude: `${headers['x-application-latitude']}`,
    longitude: `${headers['x-application-longitude']}`,
    version: `${headers['x-application-version']}`,
  }
  return data
}

export default deviceInfo
