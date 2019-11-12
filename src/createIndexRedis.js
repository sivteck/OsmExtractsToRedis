const Redis = require('ioredis')
const redis = new Redis()

async function insertPlace (item) {
  let { id, type, lat, lon, tags } = item
  const name = tags.name
  let tagsKV = []
  for (const key in tags) {
    if(key.startsWith('addr:')) {
      tagsKV.push(key.slice(5))
      tagsKV.push(tags[key])
      tags[key.slice(5)] = tags[key]
    }
    if (key === 'name') tagsKV.push(key, tags[key])
  }
  tagsKV.push('description', createDescription(tags))
  if (type === 'way') {
    lat = item.centroid.lat
    lon = item.centroid.lon
  }
  try {
    await redis.hset('place:' + id, 'id', id, 'type', type, 'lat', lat, 'lon', lon, ...tagsKV)
    await redis.zadd('places', 0, name.toLowerCase() + ':' + id)
  }
  catch (error) {
    console.error(error)
  }
}

function createDescription (item) {
  let descriptionList = ['name', 'housenumber', 'street', 'city', 'pincode']
  let description = []
  for (let key of descriptionList) {
    if (key in item) description.push(item[key])
  }
  return description.join(' ')
}

module.exports = { insertPlace }
