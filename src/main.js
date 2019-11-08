const pbf2json = require('pbf2json')
const through = require('through2')
const { insertPlace } = require('./createIndex.js')

const config = {
  file: process.argv[2],
  tags: ['addr:housenumber+addr:street'],
  leveldb: '/tmp'
}

let count = 1

pbf2json.createReadStream(config)
  .pipe(through.obj(async function(item, e, next) {
    if (item.tags.name) {
      try {
        await insertPlace(item)
      }
      catch (error) {
        console.error(error)
      }
      count++
    }
    next()
}))
