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

  const ageDays = moment().diff(moment(birthday), 'days')

  console.log(`Age Days : ${ageDays}`)
  //Verificar a idade nesse ponto aqui

  currentTreatmentDoses.sort((a, b) => {
    return a.numDays - b.numDays
  })

  //Caso o numero de dias da criança seja inferior ao valor minimo de aplicação da dose
  //Atribui a dose que aparece primeiro
  if (ageDays < currentTreatmentDoses[0].numDays) {
    console.log('Número de dias inferior ao valor minímo')
    return currentTreatmentDoses[0].id
  }

  console.log(`List size : ${currentTreatmentDoses.length}`)

  //Caso o numero de dias da criança seja maior ao valor máximo de aplicação da dose
  //Atribui a dose que aparece no final
  const lastDoseIndex = currentTreatmentDoses.length - 1

  if (ageDays > currentTreatmentDoses[lastDoseIndex].numDays) {
    console.log('Número de dias maior ao valor máximo')
    return currentTreatmentDoses[lastDoseIndex].id
  }

  for (let i = 0; i < currentTreatmentDoses.length - 1; i++) {
    console.log(`Count ${i}`)
    if (
      ageDays >= currentTreatmentDoses[i].numDays &&
      ageDays < currentTreatmentDoses[i + 1].numDays
    ) {
      console.log(
        `INTERVALO : ${currentTreatmentDoses[i].numDays}  E  ${
          currentTreatmentDoses[i + 1].numDays
        }   `
      )
      return currentTreatmentDoses[i].id
    }
    // console.log(currentTreatmentDoses[i].numDays)
  }
}

export default doseStrategy
