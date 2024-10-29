require('../models')
const request = require('supertest')
const app = require('../app')

let user
let TOKEN
let hotelId

const BASE_URL = '/api/v1/hotels'

let hotel
let cityId


beforeAll(async () => {
  user = await request(app)
    .post('/api/v1/users')
    .send({
      firstName: "Sergio",
      lastName: "Maestre",
      email: "Sergio@gmail.com",
      password: "sergio1234",
      gender: "male"
    })

  const credentials = {
    email: "Sergio@gmail.com",
    password: "sergio1234"
  }

  const resToken = await request(app)
    .post('/api/v1/users/login')
    .send(credentials)

  TOKEN = resToken.body.token


  const city = await request(app)
    .post('/api/v1/cities')
    .send({
      name: "Bogota",
      country: "Colombia",
      countryId: "Co"
    })
    .set('Authorization', `Bearer ${TOKEN}`)

  cityId = city.body.id

  hotel = {
    name: "JW Marriott Hotel",
    description: "El JW Marriott Bogotá ofrece lujo moderno en el corazón de la ciudad, con habitaciones elegantes, spa, gastronomía refinada y fácil acceso a zonas exclusivas.",
    price: "596",
    address: "El JW Marriott Bogotá se encuentra en la Calle 73 #8-60, en la zona financiera de Bogotá, cerca de la Zona G, famosa por su gastronomía.",
    lat: "4.6588",
    lon: "-74.057",
    raiting: "5.0",
      cityId
  }

})

afterAll(async () => {
  await request(app)
    .delete(`/api/v1/users/${user.body.id}`)
    .set('Authorization', `Bearer ${TOKEN}`)

  await request(app)
    .delete(`/api/v1/cities/${cityId}`)
    .set('Authorization', `Bearer ${TOKEN}`)
})

test("POST -> 'BASE_URL', should return status code 201, and res.body.name === city.name", async () => {

  const res = await request(app)
    .post(BASE_URL)
    .send(hotel)
    .set('Authorization', `Bearer ${TOKEN}`)

  hotelId = res.body.id

  expect(res.status).toBe(201)
  expect(res.body).toBeDefined()
  expect(res.body.name).toBe(hotel.name)
})


test("GET -> 'BASE_URL', should return status code 200, and res.body.length === 1", async () => {

  const res = await request(app)
    .get(BASE_URL)

  expect(res.status).toBe(200)
  expect(res.body).toBeDefined()
  expect(res.body).toHaveLength(1)
  expect(res.body[0].name).toBe(hotel.name)
})

test("GET -> 'BASE_URL/:id', should return status code 200, and res.body.name === city.name", async () => {

  const res = await request(app)
    .get(`${BASE_URL}/${hotelId}`)

  expect(res.status).toBe(200)
  expect(res.body).toBeDefined()
  expect(res.body.name).toBe(hotel.name)
})

test("PUT -> 'BASE_URL/:id', should return status code 200, and res.body.name === cityUpdate.name", async () => {

  const hotelUpdate = {
    name: 'trujillo'
  }

  const res = await request(app)
    .put(`${BASE_URL}/${hotelId}`)
    .send(hotelUpdate)
    .set('Authorization', `Bearer ${TOKEN}`)

  expect(res.status).toBe(200)
  expect(res.body).toBeDefined()
  expect(res.body.name).toBe(hotelUpdate.name)
})


test("REMOVE -> 'BASE_URL/:id', should return status code 204", async () => {
  const res = await request(app)
    .delete(`${BASE_URL}/${hotelId}`)
    .set('Authorization', `Bearer ${TOKEN}`)

  expect(res.status).toBe(204)
})