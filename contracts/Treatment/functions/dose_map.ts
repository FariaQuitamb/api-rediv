import TreatmentDose from 'App/Modules/Treatment/Models/TreatmentDose'

const doseMap = async () => {
  const doses = await TreatmentDose.query().where('Visualizar', 'S')

  return doses
}

export default doseMap
