const exportToCsv = (
  data = [
    ['value1', 'value2'],
    ['value1b', 'value2b']
  ]
) => {
  let csvContent = 'data:text/csv;charset=utf-8,'

  data.forEach((infoArray, index) => {
    const dataString = infoArray.join(',')
    csvContent += index < data.length ? dataString + '\n' : dataString
  })

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'exported_data.csv')
  document.body.appendChild(link) // Required for Firefox

  link.click()
}

export default exportToCsv
