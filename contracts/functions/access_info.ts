const accessInfo = (headers: any) => {
  const data = {
    name: `${headers['x-application-name']}`,
    id: `${headers['x-application-id']}`,
    accessKey: `${headers['x-application-key']}`,
  }
  return data
}

export default accessInfo
