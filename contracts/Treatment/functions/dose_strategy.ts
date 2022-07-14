import TreatmentDose from 'App/Modules/Treatment/Models/TreatmentDose'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import moment from 'moment'

const doseStrategy = async (
  request: any,
  auth: any,
  doseMap: TreatmentDose[],
  treatmentId: number,
  birthday: string
) => {
  const currentTreatmentDoses = doseMap.filter((dose) => dose.treatmentId === treatmentId)

  //Obter o numero de dias em função da data de nascimento

  const ageDays = moment().diff(moment(birthday), 'days')

  if (ageDays === null || ageDays === undefined) {
    formatedLog({
      text: `Não foi possível converter a data (${birthday}) em dias : Id Tratamento-> ${treatmentId}`,
      type: LogType.error,
      data: { birthday, childNumDays: ageDays },
      auth: auth,
      request: request,
    })
    return 0
  }

  if (currentTreatmentDoses.length === 0) {
    formatedLog({
      text: `Não existe dose para o tratamento selecionado : Id Tratamento-> ${treatmentId} Dose -> 0`,
      type: LogType.warning,
      data: { birthday, childNumDays: ageDays },
      auth: auth,
      request: request,
    })
    return 0
  }

  //Caso tenha apenas uma dose , assume que todos usam essa dose
  if (currentTreatmentDoses.length === 1) {
    const dose = currentTreatmentDoses[0].id
    formatedLog({
      text: `Existe apenas uma dose do tratamento selecionado, assumindo a dose única como sendo a que foi aplicada : Id Tratamento-> ${treatmentId} Dose -> ${dose}`,
      type: LogType.warning,
      data: { birthday, childNumDays: ageDays },
      auth: auth,
      request: request,
    })
    return dose
  }

  //Ordena o número de dias de aplicação de doses para prevenir erros no intervalo entre doses
  currentTreatmentDoses.sort((a, b) => {
    return a.numDays - b.numDays
  })

  //Verificar a idade nesse ponto aqui
  //Caso o numero de dias da criança seja inferior ao valor minimo de aplicação da dose
  //Atribui a dose que aparece primeiro
  if (ageDays < currentTreatmentDoses[0].numDays) {
    const dose = currentTreatmentDoses[0].id
    formatedLog({
      text: `Número de dias inferior ao valor mínimo de aplicação do tratamento assumindo a dose mínima como aplicada: Id Tratamento-> ${treatmentId} Dose -> ${dose}`,
      type: LogType.warning,
      data: { birthday, childNumDays: ageDays },
      auth: auth,
      request: request,
    })
    return dose
  }

  console.log(`Número de doses do tratamento selecionado: ${currentTreatmentDoses.length}`)

  //Caso o numero de dias da criança seja maior ao valor máximo de aplicação da dose
  //Atribui a dose que aparece no final
  const lastDoseIndex = currentTreatmentDoses.length - 1

  if (ageDays > currentTreatmentDoses[lastDoseIndex].numDays) {
    const dose = currentTreatmentDoses[lastDoseIndex].id
    formatedLog({
      text: `Número de dias maior que o valor máximo de aplicação do tratamento , assumindo a última dose como aplicada : Id Tratamento-> ${treatmentId} Dose -> ${dose}`,
      type: LogType.warning,
      data: { birthday, childNumDays: ageDays },
      auth: auth,
      request: request,
    })
    return dose
  }

  //Busca nos intervalos de dias existentes
  for (let i = 0; i < currentTreatmentDoses.length - 1; i++) {
    if (
      ageDays >= currentTreatmentDoses[i].numDays &&
      ageDays < currentTreatmentDoses[i + 1].numDays
    ) {
      formatedLog({
        text: `A dose selecionada pertence ao intervalo de: ${currentTreatmentDoses[i].numDays} E ${
          currentTreatmentDoses[i + 1].numDays
        } : Dias da criança: ${ageDays} Id Tratamento-> ${treatmentId}`,
        type: LogType.warning,
        data: { birthday, childNumDays: ageDays },
        auth: auth,
        request: request,
      })
      return currentTreatmentDoses[i].id
    }
    // console.log(currentTreatmentDoses[i].numDays)
  }

  formatedLog({
    text: `A selecção da dose do tratamento saiu do escopo tratado : Id Tratamento-> ${treatmentId}`,
    type: LogType.error,
    data: { birthday, childNumDays: ageDays },
    auth: auth,
    request: request,
  })
  return 0
}

export default doseStrategy
