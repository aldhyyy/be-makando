const { runQuery } = require('../config/db')

exports.GetReview = (id, idUser, params) => {
  return new Promise((resolve, reject) => {
    if (id) {
      console.log(id)
      runQuery(`SELECT * FROM itemReviews WHERE _id =${id} ${idUser ? `'AND id_user ='${idUser}` : ''}`, (err, results, fields) => {
        if (err) {
          return reject(new Error(err))
        }
        if (!(results[1].length > 0)) {
          return resolve(false)
        }
        return resolve(results[1][0])
      })
    } else {
      const { perPage, currentPage, search, sort } = params
      const condition = `
          ${search && `WHERE ${search.map(v => `${v.key} LIKE '%${v.value}%'`).join(' AND ')}`}
          ${idUser ? `'AND id_user ='${idUser}` : ''}
          ORDER BY ${sort.map(v => `${v.key} ${!v.value ? 'ASC' : 'DESC'}`).join(' , ')}
          ${(parseInt(currentPage) && parseInt(perPage)) ? `LIMIT ${parseInt(perPage)} 
          OFFSET ${(parseInt(currentPage) - 1) * parseInt(perPage)}` : ''}
         `
      runQuery(`
        SELECT COUNT(*) AS total from itemReviews ${condition.substring(0, condition.indexOf('LIMIT'))};
        SELECT * from itemReviews ${condition}
      `, (err, results, fields) => {
        if (err) {
          return reject(new Error(err))
        }
        if (results[1][0]) {
          const { total } = results[1][0]
          return resolve({ results: results[2], total })
        } else {
          return resolve({ results: [], total: 0 })
        }
      })
    }
  })
}

exports.CreateReview = (idUser, params) => {
  return new Promise((resolve, reject) => {
    runQuery(`SELECT COUNT(*) as total FROM itemReviews WHERE id_user='${idUser} AND id_item=${params.id_item}'`, (err, results, fields) => {
      if (err || results[1][0].total) {
        return reject(new Error(err || 'Already Review this item You Can Update or Delete this review'))
      }
      runQuery(`INSERT INTO itemReviews(id_item,id_user,rating,review) VALUES(${params.id_item},${idUser}, ${params.rating},'${params.review}')`, (err, results, fields) => {
        if (err) {
          return reject(new Error(err))
        }
        console.log(results[1])
        return resolve(results[1].insertId)
      })
    })
  })
}
