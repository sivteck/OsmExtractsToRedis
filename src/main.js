const pbf2json = require('pbf2json')
const through = require('through2')
const { pipeline } = require('stream')
const { insertPlace } = require('./createIndexRedis.js')

const config = {
  file: process.argv[2],
  tags: ['addr:housenumber+addr:street'],
  leveldb: '/tmp'
}

let count = 1

let inputStream = pbf2json.createReadStream(config)
let transformStream = through.obj(async function(item, e, next) {
    if (item.tags.name) {
      try {
        // if (item.tags.amenity === 'restaurant') console.log(item)
        await insertPlace(item)
      }
      catch (error) {
        console.error(error)
      }
      count++
    }
    next()
})

//inputStream.pipe(transformStream)

//inputStream.on('end', () => transformStream.end())
//transformStream.on('end', () => transformStream.end())
const processedCallback = (e) => console.log('mememeemememem')
pipeline(inputStream, transformStream, processedCallback)
