function filterFields(data, allowedFields) {
  const filtered = {}
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      filtered[field] = data[field]
    }
  })
  return filtered
}

module.exports = { filterFields }
