import TreatmentDose from 'App/Modules/Treatment/Models/TreatmentDose'
import moment from 'moment'

const doseStrategy = async (doseMap: TreatmentDose[], treatmentId: number, birthday: string) => {
  const currentTreatmentDoses = doseMap.filter((dose) => dose.treatmentId === treatmentId)

  if (currentTreatmentDoses.length === 0) {
    console.log('Tratamento sem dose disponível')
    return 0
  }

  //Caso tenha apenas uma dose , assume que todos usam essa dose
  if (currentTreatmentDoses.length === 1) {
    return currentTreatmentDoses[0].id
  }

  //Obter o numero de dias em função da data de nascimento

  const days = moment().diff(moment(birthday), 'days')

  console.log(days)
  //Verificar a idade nesse ponto aqui
  currentTreatmentDoses.forEach((dose) => {})
}

export default doseStrategy
