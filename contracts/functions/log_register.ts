import LogVaccine from 'App/Models/LogVaccine'

const logRegister = async (args: {
  id: number
  system: string
  job: string
  screen: string
  table: string
  tableId: number
  action: string
  actionId: string
}) => {
  const log = await LogVaccine.create(args)

  return log
}

export default logRegister
