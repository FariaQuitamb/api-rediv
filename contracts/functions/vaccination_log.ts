import VaccinationLog from 'App/Models/VaccinationLog'

const vaccinationLog = async (args: {
  userId: number
  vaccinationId: number
  system: string
  job: string
  screen: string
  action: string
  observation: string
  userPostoVaccination: number
}) => {
  const log = await VaccinationLog.create(args)

  return log
}

export default vaccinationLog
