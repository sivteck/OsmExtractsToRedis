const Pool = require('pg').Pool
const pgConfig = require('./postgres.js')

const pool = new Pool(pgConfig)

const restaurantTable = `CREATE TABLE IF NOT EXISTS restaurants (
                        id VARCHAR PRIMARY KEY,
                        name VARCHAR NOT NULL,
                        description VARCHAR NOT NULL,
                        city VARCHAR NOT NULL,
                        location geometry
                        )`

function query (text, params) {
  return pool.query(text, params)
}

async function initDb () {
  try {
    await pool.query(restaurantTable)
  }
  catch (error) {
    console.error(error)
  }
}

async function insertRestaurant (item) {
  let { id, type, lat, lon, tags } = item
  const name = tags.name
  const city = 'Bengaluru'
  for (const key in tags) {
    if (key.startsWith('addr:')) {
      tags[key.slice(5)] = tags[key]
    }
  }
  const description = createDescription(tags)
  if (type === 'way') {
    lat = item.centroid.lat
    lon = item.centroid.lon
  }
  const text = 'INSERT INTO restaurants VALUES ($1, $2, $3, $4, ST_MakePoint($5, $6))'
  const values = [id, name, city, description, lat, lon]
  try {
    if (name !== undefined) console.log(id, name, city, lat, lon, description)
    await query(text, values)
  }
  catch (error) {
    console.error(error)
  }
}

function createDescription (item) {
  const descriptionList = ['name', 'housenumber', 'street', 'city', 'pincode']
  let description = []
  for (const key of descriptionList) {
    if (key in item) description.push(item[key])
  }
  return description.join(' ')
}

async function getRestaurants ({ latitude, longitude }, radius) {
  const text = `SELECT * FROM restaurants where ST_Distance(ST_GeogFromWKB(location), ST_GeogFromWKB(ST_MakePoint($1, $2))) < $3` 
  const values = [latitude, longitude, radius]
  try {
    const result = await query(text, values)
    return result.rows
  }
  catch (error) {
    console.error(error)
  }
}

module.exports = { initDb, insertRestaurant, getRestaurants }
