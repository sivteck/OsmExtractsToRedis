const Redis = require('ioredis')
const redis = new Redis()

async function insertPlace ({ id, type,  lat, lon, tags }) {
  const name = tags.name
  try {
    await redis.hset('place:' + id, 'name', name, 'type', type, 'lat', lat, 'lon', lon)
    await redis.zadd('places', 0, name)
  }
  catch (error) {
    console.error(error)
  }
}

module.exports = { insertPlace }
