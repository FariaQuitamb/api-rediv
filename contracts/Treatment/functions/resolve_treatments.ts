import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import isAfterToday from 'Contracts/functions/isafter_today'
import moment from 'moment'

interface Treatment {
  personId: number
  campaignId: number
  illnessId: number
  treatmentId: number
  treatmentDoseId: number | undefined
  vaccinationPostUserId: number
  latitude: string
  longitude: string
  createdAt: string
}

const resolveTreatment = (request, auth, treatments: Treatment[]) => {
  for (let i = 0; i < treatments.length; i++) {
    if (isAfterToday(treatments[i].createdAt)) {
      const previewsDate = treatments[i].createdAt
      treatments[i].createdAt = moment().toISOString()
      formatedLog({
        text: `A data de aplicação do tratamento foi modificada para data de hoje! Data Inserida: ${previewsDate} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
        data: treatments[i],
        auth: auth,
        request: request,
        type: LogType.warning,
      })
    }

    const prevDate = treatments[i].createdAt

    treatments[i].createdAt = moment(treatments[i].createdAt, moment.ISO_8601, true).toISOString()
    //Caso tenha inserido data que não seja possível converter
    if (treatments[i].createdAt === null) {
      treatments[i].createdAt = moment().toISOString()

      formatedLog({
        text: `A data de aplicação do tratamento foi modificada para data de hoje! Data Inserida: ${prevDate} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
        data: treatments[i],
        auth: auth,
        request: request,
        type: LogType.warning,
      })
    }

    console.log(treatments[i])
    treatments[i].treatmentDoseId = 10101 * i
    console.log(treatments[i])
  }
  return treatments
}

export default resolveTreatment
