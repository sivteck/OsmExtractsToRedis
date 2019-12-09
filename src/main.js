const pbf2json = require('pbf2json')
const through = require('through2')
const { pipeline } = require('stream')
const { insertPlace } = require('./createIndexPostgres.js')
const { insertRestaurant } = require('./createIndexPostgres')

const config = {
  file: process.argv[2],
  tags: ['addr:housenumber+addr:street'],
  leveldb: '/tmp'
}

console.log(config)

let count = 1

let inputStream = pbf2json.createReadStream(config)
let transformStream = through.obj(async function(item, e, next) {
  try {
    if (item.tags.amenity === 'restaurant') 
      await insertRestaurant(item)
  }
  catch (error) {
    console.error(error)
  }
  count++
  next()
})

//inputStream.pipe(transformStream)

inputStream.on('end', () => transformStream.end())
transformStream.on('end', () => transformStream.end())
const processedCallback = (e) => console.log('mememeemememem')
pipeline(inputStream, transformStream, processedCallback)
