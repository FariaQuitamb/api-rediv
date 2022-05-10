const generateQuery = (fields: Array<{ field: string; value: any }>) => {
  const filters: Array<{ field: string; value: any }> = []

  fields.forEach((info) => {
    if (info.value !== undefined && info.value !== ' ') {
      const value = { field: info.field, value: info.value }
      filters.push(value)
    }
  })

  let query = ''

  if (filters.length === 1) {
    if (filters[0].field === 'Data') {
      query = ` CONVERT(date,[Data]) =  CONVERT(date,'${filters[0].value}')`
    } else {
      query += `${filters[0].field} = '${filters[0].value}'`
    }
  } else {
    let filterQuery: string
    filters.map((elem, index) => {
      if (elem.field === 'Data') {
        filterQuery = ` CONVERT(date,[Data]) =  CONVERT(date,'${elem.value}')`
      } else {
        filterQuery = ` ${elem.field} = '${elem.value}'`
      }

      if (index === 0) {
        query += filterQuery
      } else {
        query += ` and ${filterQuery}`
      }
    })
  }

  return query
}

export default generateQuery
