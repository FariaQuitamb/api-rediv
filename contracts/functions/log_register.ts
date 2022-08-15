import LogVaccine from 'App/Models/LogVaccine'
//Changed user id field
const logRegister = async (args: {
  user_id: number
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
