import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import isAfterToday from 'Contracts/functions/isafter_today'
import moment from 'moment'
import doseMap from './dose_map'
import doseStrategy from './dose_strategy'

interface Treatment {
  personId: number | undefined
  campaignId: number | undefined
  illnessId: number
  treatmentId: number
  treatmentDoseId: number | undefined
  vaccinationPostId: number | undefined
  vaccinationPostUserId: number | undefined
  latitude: string | undefined
  longitude: string | undefined
  createdAt: string
}

interface TreatmentData {
  campaignId: number
  personId: number
  birthday: string
  vaccinationPostUserId: number
  vaccinationPostId: number
  latitude: string
  longitude: string
  treatments: Treatment[]
}

const resolveTreatment = async (request, auth, treatmentData: TreatmentData) => {
  //Start - Atribuição de dose estratégia

  const map = await doseMap()

  //End

  for (let i = 0; i < treatmentData.treatments.length; i++) {
    //Start strategy

    //Get dose acording to child age and treatment

    const doseId = await doseStrategy(
      request,
      auth,
      map,
      treatmentData.treatments[i].treatmentId,
      treatmentData.birthday
    )

    console.log(`Dose Aplicada: ${doseId}`)

    treatmentData.treatments[i].treatmentDoseId = doseId

    //Start - Organização do objecto - Juntar propriedades
    treatmentData.treatments[i].campaignId = treatmentData.campaignId
    treatmentData.treatments[i].personId = treatmentData.personId
    treatmentData.treatments[i].vaccinationPostId = treatmentData.vaccinationPostId
    treatmentData.treatments[i].vaccinationPostUserId = treatmentData.vaccinationPostUserId
    treatmentData.treatments[i].latitude = treatmentData.latitude
    treatmentData.treatments[i].longitude = treatmentData.longitude

    //End

    //Verifica se é necessário validar a data do futuro
    let checkFuture = true

    const previewsDate = treatmentData.treatments[i].createdAt

    //Mudança : formatação da data

    treatmentData.treatments[i].createdAt = moment(
      treatmentData.treatments[i].createdAt,
      moment.ISO_8601,
      true
    ).toISOString()

    if (treatmentData.treatments[i].createdAt === null) {
      checkFuture = false

      const today = moment()
      treatmentData.treatments[i].createdAt = moment(today, moment.ISO_8601, true).toISOString()

      formatedLog({
        text: `A data de aplicação do tratamento foi modificada para data de hoje, por ser inválida: ${previewsDate} data final : ${treatmentData.treatments[i].createdAt} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
        data: treatmentData.treatments[i],
        auth: auth,
        request: request,
        type: LogType.warning,
      })
    }

    if (checkFuture) {
      if (isAfterToday(treatmentData.treatments[i].createdAt)) {
        treatmentData.treatments[i].createdAt = moment().toISOString()
        formatedLog({
          text: `Data superior ao dia actual : A data de aplicação do tratamento foi modificada para data de hoje por ser maior a data actual data inserida: ${previewsDate} data final: ${treatmentData.treatments[i].createdAt} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: treatmentData.treatments[i],
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }
    }
  }

  return treatmentData.treatments
}

export default resolveTreatment
